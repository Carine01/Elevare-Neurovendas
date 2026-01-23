"""
Social Publishing Module
Gerencia publicação automática em múltiplas plataformas
Suporta: Medium, Dev.to, WordPress, LinkedIn, Twitter/X
"""

import logging
import aiohttp
import requests
from typing import Optional, Dict, Any, List
from datetime import datetime
import os

logger = logging.getLogger(__name__)


class SocialPublisher:
    """Gerenciador de publicação em plataformas sociais"""
    
    # API Keys (carregar do .env)
    MEDIUM_TOKEN = os.getenv("MEDIUM_API_TOKEN", "")
    DEVTO_TOKEN = os.getenv("DEVTO_API_KEY", "")
    WORDPRESS_URL = os.getenv("WORDPRESS_URL", "")
    WORDPRESS_USER = os.getenv("WORDPRESS_USER", "")
    WORDPRESS_PASSWORD = os.getenv("WORDPRESS_PASSWORD", "")
    LINKEDIN_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN", "")
    TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN", "")
    
    @staticmethod
    def _format_for_platform(post_data: Dict[str, Any], platform: str) -> Dict[str, Any]:
        """Formata dados do post para o formato esperado por cada plataforma"""
        
        formatted = {
            "title": post_data.get("titulo", ""),
            "content": post_data.get("introducao", ""),
            "tags": post_data.get("tags", []),
        }
        
        if platform == "medium":
            # Medium espera: title, content, tags, publishStatus
            formatted["publishStatus"] = "draft"  # ou "public"
            formatted["contentFormat"] = "markdown"
            
        elif platform == "devto":
            # Dev.to espera: title, body, tags, published, canonical_url
            formatted["body"] = post_data.get("introducao", "")
            # Adicionar todas as seções
            if post_data.get("secoes"):
                formatted["body"] += "\n\n" + "\n\n".join([
                    f"## {s.get('titulo')}\n{s.get('conteudo')}" 
                    for s in post_data.get("secoes", [])
                ])
            formatted["published"] = False
            formatted["canonical_url"] = post_data.get("urls_publicadas", {}).get("original", "")
            
        elif platform == "wordpress":
            # WordPress espera: title, content, status, tags, categories
            formatted["status"] = "draft"  # ou "publish"
            formatted["categories"] = [post_data.get("categoria", "")]
            formatted["content"] = post_data.get("introducao", "")
            if post_data.get("secoes"):
                formatted["content"] += "\n\n" + "\n\n".join([
                    f"<h2>{s.get('titulo')}</h2>\n{s.get('conteudo')}" 
                    for s in post_data.get("secoes", [])
                ])
            
        elif platform == "linkedin":
            # LinkedIn espera: commentary, content (rich text)
            formatted["commentary"] = post_data.get("introducao", "")
            formatted["articleLink"] = post_data.get("imagem_destaque", "")
            
        elif platform == "twitter":
            # Twitter/X: limitar a 280 caracteres e quebrar em threads
            formatted["text"] = post_data.get("titulo", "")[:280]
            formatted["thread"] = [
                post_data.get("titulo", "")[:280],
                post_data.get("introducao", "")[:280],
            ]
            if post_data.get("secoes"):
                for section in post_data.get("secoes", [])[:3]:  # Máximo 3 seções na thread
                    formatted["thread"].append(
                        f"{section.get('titulo')}: {section.get('conteudo')}"[:280]
                    )
        
        return formatted


class MediumPublisher(SocialPublisher):
    """Publisher para Medium"""
    
    BASE_URL = "https://api.medium.com/v1"
    
    @classmethod
    async def publish(cls, post_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Publica artigo no Medium"""
        
        if not cls.MEDIUM_TOKEN:
            logger.error("MEDIUM_API_TOKEN não configurado")
            return None
        
        try:
            # Obter user ID
            async with aiohttp.ClientSession() as session:
                headers = {"Authorization": f"Bearer {cls.MEDIUM_TOKEN}"}
                
                # Obter usuário atual
                async with session.get(f"{cls.BASE_URL}/me", headers=headers) as resp:
                    if resp.status != 200:
                        logger.error(f"Erro ao obter usuário Medium: {resp.status}")
                        return None
                    user_data = await resp.json()
                    user_id = user_data["data"]["id"]
                
                # Formatar conteúdo
                formatted = cls._format_for_platform(post_data, "medium")
                
                # Criar post
                payload = {
                    "title": formatted["title"],
                    "contentFormat": "markdown",
                    "content": formatted["content"],
                    "publishStatus": "draft",
                    "tags": formatted["tags"]
                }
                
                async with session.post(
                    f"{cls.BASE_URL}/users/{user_id}/posts",
                    headers=headers,
                    json=payload
                ) as resp:
                    if resp.status == 201:
                        result = await resp.json()
                        return {
                            "platform": "medium",
                            "post_id": result["data"]["id"],
                            "url": result["data"]["authorUrl"],
                            "status": "success"
                        }
                    else:
                        logger.error(f"Erro ao criar post no Medium: {resp.status}")
                        return None
        
        except Exception as e:
            logger.error(f"Erro ao publicar no Medium: {str(e)}")
            return None


class DevtoPublisher(SocialPublisher):
    """Publisher para Dev.to"""
    
    BASE_URL = "https://dev.to/api"
    
    @classmethod
    async def publish(cls, post_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Publica artigo no Dev.to"""
        
        if not cls.DEVTO_TOKEN:
            logger.error("DEVTO_API_KEY não configurado")
            return None
        
        try:
            formatted = cls._format_for_platform(post_data, "devto")
            
            async with aiohttp.ClientSession() as session:
                headers = {
                    "api-key": cls.DEVTO_TOKEN,
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "article": {
                        "title": formatted["title"],
                        "body_markdown": formatted["body"],
                        "published": False,
                        "tags": formatted["tags"][:4],  # Dev.to permite máximo 4 tags
                        "canonical_url": formatted.get("canonical_url", "")
                    }
                }
                
                async with session.post(
                    f"{cls.BASE_URL}/articles",
                    headers=headers,
                    json=payload
                ) as resp:
                    if resp.status == 201:
                        result = await resp.json()
                        return {
                            "platform": "devto",
                            "post_id": result["id"],
                            "url": result["url"],
                            "status": "success"
                        }
                    else:
                        logger.error(f"Erro ao criar post no Dev.to: {resp.status}")
                        text = await resp.text()
                        logger.error(f"Resposta: {text}")
                        return None
        
        except Exception as e:
            logger.error(f"Erro ao publicar no Dev.to: {str(e)}")
            return None


class WordPressPublisher(SocialPublisher):
    """Publisher para WordPress via REST API"""
    
    @classmethod
    async def publish(cls, post_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Publica artigo no WordPress"""
        
        if not cls.WORDPRESS_URL or not cls.WORDPRESS_USER or not cls.WORDPRESS_PASSWORD:
            logger.error("Credenciais WordPress não configuradas")
            return None
        
        try:
            formatted = cls._format_for_platform(post_data, "wordpress")
            
            # Usar requests para WordPress (melhor compatibilidade)
            import base64
            
            credentials = base64.b64encode(
                f"{cls.WORDPRESS_USER}:{cls.WORDPRESS_PASSWORD}".encode()
            ).decode()
            
            headers = {
                "Authorization": f"Basic {credentials}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "title": formatted["title"],
                "content": formatted["content"],
                "status": "draft",
                "tags": formatted.get("tags", []),
                "categories": formatted.get("categories", [])
            }
            
            # Usar requests.post (síncrono, mas funciona)
            response = requests.post(
                f"{cls.WORDPRESS_URL}/wp-json/wp/v2/posts",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 201:
                result = response.json()
                return {
                    "platform": "wordpress",
                    "post_id": result["id"],
                    "url": result["link"],
                    "status": "success"
                }
            else:
                logger.error(f"Erro ao criar post no WordPress: {response.status_code}")
                logger.error(f"Resposta: {response.text}")
                return None
        
        except Exception as e:
            logger.error(f"Erro ao publicar no WordPress: {str(e)}")
            return None


class LinkedInPublisher(SocialPublisher):
    """Publisher para LinkedIn"""
    
    BASE_URL = "https://api.linkedin.com/v2"
    
    @classmethod
    async def publish(cls, post_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Publica artigo no LinkedIn"""
        
        if not cls.LINKEDIN_TOKEN:
            logger.error("LINKEDIN_ACCESS_TOKEN não configurado")
            return None
        
        try:
            formatted = cls._format_for_platform(post_data, "linkedin")
            
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {cls.LINKEDIN_TOKEN}",
                    "Content-Type": "application/json",
                    "X-Restli-Protocol-Version": "2.0.0"
                }
                
                # Criar artigo no LinkedIn
                payload = {
                    "author": "urn:li:person:YOUR_PERSON_URN",  # Será obtido dinamicamente
                    "commentary": formatted["commentary"],
                    "content": {
                        "contentEntities": [
                            {
                                "entity": formatted["articleLink"]
                            }
                        ],
                        "title": formatted["title"],
                        "description": post_data.get("introducao", "")[:100]
                    },
                    "visibility": {
                        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                    }
                }
                
                async with session.post(
                    f"{cls.BASE_URL}/ugcPosts",
                    headers=headers,
                    json=payload
                ) as resp:
                    if resp.status == 201:
                        result = await resp.json()
                        return {
                            "platform": "linkedin",
                            "post_id": result.get("id"),
                            "status": "success"
                        }
                    else:
                        logger.error(f"Erro ao criar post no LinkedIn: {resp.status}")
                        return None
        
        except Exception as e:
            logger.error(f"Erro ao publicar no LinkedIn: {str(e)}")
            return None


class TwitterPublisher(SocialPublisher):
    """Publisher para Twitter/X"""
    
    BASE_URL = "https://api.twitter.com/2"
    
    @classmethod
    async def publish(cls, post_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Publica artigo como thread no Twitter/X"""
        
        if not cls.TWITTER_BEARER_TOKEN:
            logger.error("TWITTER_BEARER_TOKEN não configurado")
            return None
        
        try:
            formatted = cls._format_for_platform(post_data, "twitter")
            
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {cls.TWITTER_BEARER_TOKEN}",
                    "Content-Type": "application/json"
                }
                
                # Criar thread de tweets
                tweet_ids = []
                reply_to_id = None
                
                for tweet_text in formatted["thread"]:
                    payload = {
                        "text": tweet_text
                    }
                    
                    if reply_to_id:
                        payload["reply"] = {
                            "in_reply_to_tweet_id": reply_to_id
                        }
                    
                    async with session.post(
                        f"{cls.BASE_URL}/tweets",
                        headers=headers,
                        json=payload
                    ) as resp:
                        if resp.status == 201:
                            result = await resp.json()
                            tweet_id = result["data"]["id"]
                            tweet_ids.append(tweet_id)
                            reply_to_id = tweet_id
                        else:
                            logger.error(f"Erro ao criar tweet: {resp.status}")
                            return None
                
                return {
                    "platform": "twitter",
                    "tweet_ids": tweet_ids,
                    "status": "success"
                }
        
        except Exception as e:
            logger.error(f"Erro ao publicar no Twitter: {str(e)}")
            return None


class NotionPublisher(SocialPublisher):
    """Publisher para Notion"""
    
    BASE_URL = "https://api.notion.com/v1"
    
    @classmethod
    async def publish(cls, post_data: Dict[str, Any], database_id: str) -> Optional[Dict[str, Any]]:
        """Publica artigo como página no Notion"""
        
        notion_token = os.getenv("NOTION_API_TOKEN", "")
        
        if not notion_token:
            logger.error("NOTION_API_TOKEN não configurado")
            return None
        
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {notion_token}",
                    "Content-Type": "application/json",
                    "Notion-Version": "2022-06-28"
                }
                
                # Criar página no Notion
                payload = {
                    "parent": {
                        "database_id": database_id
                    },
                    "properties": {
                        "Title": {
                            "title": [
                                {
                                    "text": {
                                        "content": post_data.get("titulo", "")
                                    }
                                }
                            ]
                        },
                        "Tags": {
                            "multi_select": [
                                {"name": tag} for tag in post_data.get("tags", [])
                            ]
                        }
                    },
                    "children": [
                        {
                            "object": "block",
                            "type": "heading_1",
                            "heading_1": {
                                "rich_text": [
                                    {
                                        "type": "text",
                                        "text": {
                                            "content": post_data.get("titulo", "")
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "object": "block",
                            "type": "paragraph",
                            "paragraph": {
                                "rich_text": [
                                    {
                                        "type": "text",
                                        "text": {
                                            "content": post_data.get("introducao", "")
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
                
                # Adicionar seções
                for section in post_data.get("secoes", []):
                    payload["children"].extend([
                        {
                            "object": "block",
                            "type": "heading_2",
                            "heading_2": {
                                "rich_text": [
                                    {
                                        "type": "text",
                                        "text": {
                                            "content": section.get("titulo", "")
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            "object": "block",
                            "type": "paragraph",
                            "paragraph": {
                                "rich_text": [
                                    {
                                        "type": "text",
                                        "text": {
                                            "content": section.get("conteudo", "")[:2000]  # Limitar tamanho
                                        }
                                    }
                                ]
                            }
                        }
                    ])
                
                async with session.post(
                    f"{cls.BASE_URL}/pages",
                    headers=headers,
                    json=payload
                ) as resp:
                    if resp.status == 200:
                        result = await resp.json()
                        return {
                            "platform": "notion",
                            "page_id": result["id"],
                            "url": result["url"],
                            "status": "success"
                        }
                    else:
                        logger.error(f"Erro ao criar página no Notion: {resp.status}")
                        text = await resp.text()
                        logger.error(f"Resposta: {text}")
                        return None
        
        except Exception as e:
            logger.error(f"Erro ao publicar no Notion: {str(e)}")
            return None


class PublisherOrchestrator:
    """Orquestrador de publicação em múltiplas plataformas"""
    
    @staticmethod
    async def publish_to_platforms(
        post_data: Dict[str, Any],
        platforms: List[str],
        notion_db_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Publica post em múltiplas plataformas simultaneamente
        
        Args:
            post_data: Dados do post
            platforms: Lista de plataformas (medium, devto, wordpress, linkedin, twitter, notion)
            notion_db_id: ID da database do Notion (se usar Notion)
            
        Returns:
            Dicionário com resultados de cada plataforma
        """
        
        results = {
            "success": [],
            "failed": [],
            "timestamp": datetime.now().isoformat()
        }
        
        publishers = {
            "medium": MediumPublisher.publish,
            "devto": DevtoPublisher.publish,
            "wordpress": WordPressPublisher.publish,
            "linkedin": LinkedInPublisher.publish,
            "twitter": TwitterPublisher.publish,
        }
        
        for platform in platforms:
            try:
                if platform == "notion" and notion_db_id:
                    result = await NotionPublisher.publish(post_data, notion_db_id)
                elif platform in publishers:
                    result = await publishers[platform](post_data)
                else:
                    logger.warning(f"Plataforma desconhecida: {platform}")
                    continue
                
                if result and result.get("status") == "success":
                    results["success"].append(result)
                else:
                    results["failed"].append({
                        "platform": platform,
                        "error": "Publicação falhou"
                    })
            
            except Exception as e:
                logger.error(f"Erro ao publicar em {platform}: {str(e)}")
                results["failed"].append({
                    "platform": platform,
                    "error": str(e)
                })
        
        return results

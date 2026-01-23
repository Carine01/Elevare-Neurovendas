#!/usr/bin/env python
"""
Quick test for new Gamma features
"""
import asyncio
import httpx
import json

BACKEND_URL = "http://localhost:8000"

async def test_image_generation():
    """Test DALL-E image generation endpoint"""
    print("\n🎨 Testando Geração de Imagens...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BACKEND_URL}/api/ai/generate-image",
                json={
                    "prompt": "beautiful sunset on the beach, professional photography",
                    "size": "1024x1024"
                },
                timeout=120.0
            )
            
            data = response.json()
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(data, indent=2)}")
            
            if data.get("success"):
                print(f"✅ Imagem gerada com sucesso!")
                print(f"URL: {data.get('image_url')[:50]}...")
                print(f"Provider: {data.get('provider')}")
            else:
                print(f"❌ Erro: {data.get('error')}")
                
        except Exception as e:
            print(f"❌ Erro de conexão: {str(e)}")
            print("💡 Dica: Verifique se o backend está rodando em http://localhost:8000")

async def test_blog_post_with_templates():
    """Test blog post creation with new templates"""
    print("\n📝 Testando Blog Post com Templates...")
    
    async with httpx.AsyncClient() as client:
        try:
            # Gerar artigo
            response = await client.post(
                f"{BACKEND_URL}/api/ai/lucresia/blog-post",
                json={
                    "topico": "Estética Facial Moderna",
                    "objetivo": "Educar sobre procedimentos",
                    "publico_alvo": "mulheres 25-45 anos",
                    "num_secoes": 3,
                    "palavras_chave": ["estética", "harmonização", "beleza"]
                },
                timeout=60.0
            )
            
            data = response.json()
            print(f"Status: {response.status_code}")
            
            if data.get("success") and data.get("post"):
                post = data["post"]
                print(f"✅ Artigo gerado com sucesso!")
                print(f"Título: {post.get('titulo')}")
                print(f"Template: {post.get('template_diagramacao', 'clean')}")
                print(f"Cor Destaque: {post.get('cor_destaque', '#8B5CF6')}")
                print(f"Sugestões de Imagens: {post.get('sugestoes_imagens', [])}")
            else:
                print(f"❌ Erro: {data.get('error')}")
                print(f"Response: {json.dumps(data, indent=2)}")
                
        except Exception as e:
            print(f"❌ Erro de conexão: {str(e)}")

async def test_templates():
    """Test all new templates"""
    print("\n🎨 Templates Disponíveis:")
    
    templates = {
        'Clássicos': ['clean', 'magazine', 'minimal', 'bold'],
        'Gamma (Novo)': ['gradient', 'glass', 'slides', 'modern', 'neon', 'premium']
    }
    
    for category, templates_list in templates.items():
        print(f"\n{category}:")
        for template in templates_list:
            print(f"  ✓ {template}")

async def main():
    print("=" * 60)
    print("🚀 TESTE DE NOVOS RECURSOS - GAMMA TEMPLATES + IA IMAGES")
    print("=" * 60)
    
    # 1. Test templates
    await test_templates()
    
    # 2. Test blog post generation
    await test_blog_post_with_templates()
    
    # 3. Test image generation
    await test_image_generation()
    
    print("\n" + "=" * 60)
    print("✅ Testes concluídos!")
    print("=" * 60)
    print("\n💡 Próximos passos:")
    print("1. Configure OPENAI_API_KEY no backend/.env para ativar DALL-E")
    print("2. Abra http://localhost:3000 no navegador")
    print("3. Vá para 'Blog Creator' e teste os novos templates")
    print("4. Gere um artigo e clique em 'Gerar Imagem'")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n⚠️ Teste interrompido pelo usuário")

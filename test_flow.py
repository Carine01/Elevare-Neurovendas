#!/usr/bin/env python3
"""
Script de teste para validar endpoints da API Elevare NeuroVendas
Valida Brand Profile, AI endpoints e coerência de marca
"""

import requests
import json
import time
import sys

BASE_URL = "http://localhost:8000/api"
MAX_RETRIES = 5
RETRY_DELAY = 2

def test_health():
    """Testa endpoint de saúde"""
    print("\n📊 Testando saúde do servidor...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        response.raise_for_status()
        data = response.json()
        print(f"✅ Servidor está saudável")
        print(f"   - AI configurada: {data.get('ai_configured')}")
        print(f"   - Unsplash configurada: {data.get('unsplash_configured')}")
        return True
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
        return False

def seed_brand_profile():
    """Cria perfil de marca padrão"""
    print("\n🎨 Criando perfil de marca padrão...")
    try:
        response = requests.post(f"{BASE_URL}/brand/profile/seed", timeout=10)
        response.raise_for_status()
        data = response.json()
        print(f"✅ Perfil de marca criado: {data.get('message')}")
        return True
    except Exception as e:
        print(f"❌ Erro ao criar perfil: {e}")
        return False

def get_brand_profile():
    """Recupera perfil de marca ativo"""
    print("\n🔍 Recuperando perfil de marca ativo...")
    try:
        response = requests.get(f"{BASE_URL}/brand/profile", timeout=10)
        response.raise_for_status()
        profile = response.json()
        
        print(f"✅ Perfil carregado!")
        print(f"\n📋 Detalhes da Marca:")
        print(f"   Nome: {profile.get('nome_marca')}")
        print(f"   Segmento: {profile.get('segmento')}")
        print(f"   Tom de Voz: {profile.get('tom_de_voz')}")
        print(f"   Personalidade: {', '.join(profile.get('personalidade', []))}")
        print(f"   Valores: {', '.join(profile.get('valores', []))}")
        print(f"\n💬 Linguagem:")
        print(f"   Público-alvo: {profile.get('publico_principal')}")
        print(f"   Faixa etária: {profile.get('faixa_etaria_alvo')}")
        if profile.get('palavras_chave'):
            print(f"   Palavras-chave: {', '.join(profile.get('palavras_chave')[:5])}...")
        if profile.get('palavras_evitar'):
            print(f"   ❌ Evitar: {', '.join(profile.get('palavras_evitar')[:3])}...")
        print(f"\n🎨 Visual:")
        print(f"   Cores primárias: {', '.join(profile.get('cores_primarias', []))}")
        print(f"   Fonte principal: {profile.get('fonte_principal')}")
        
        return profile
    except Exception as e:
        print(f"❌ Erro ao recuperar perfil: {e}")
        return None

def test_lucresia_stories(brand_profile):
    """Testa geração de stories com Lucresia"""
    print("\n📱 Testando geração de Stories com Lucresia...")
    if not brand_profile:
        print("⚠️  Pulando teste (sem perfil de marca)")
        return False
    
    try:
        payload = {
            "procedimento": "Harmonização Facial",
            "objetivo": "Gerar autoridade profissional",
            "publico": "mulheres 30-50 anos buscando rejuvenescimento",
            "num_stories": 3
        }
        
        response = requests.post(
            f"{BASE_URL}/ai/lucresia/stories",
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Stories geradas!")
        print(f"   Procedimento: {data.get('procedimento')}")
        print(f"   Objetivo: {data.get('objetivo')}")
        
        if data.get('stories'):
            print(f"   Primeira story:")
            story = data['stories'][0]
            print(f"     Texto: {story.get('texto_principal')[:80]}...")
            print(f"     Estratégia: {story.get('intencao_estrategica')}")
        elif data.get('raw_content'):
            print(f"   Conteúdo gerado (raw):")
            print(f"     {data.get('raw_content')[:200]}...")
        
        return True
    except Exception as e:
        print(f"❌ Erro ao gerar stories: {e}")
        return False

def test_lucresia_titulo(brand_profile):
    """Testa geração de títulos com Lucresia"""
    print("\n📝 Testando geração de Títulos com Lucresia...")
    if not brand_profile:
        print("⚠️  Pulando teste (sem perfil de marca)")
        return False
    
    try:
        payload = {
            "prompt_type": "titulo",
            "context": "Harmonização facial com técnica avançada",
            "tone": "autoridade"
        }
        
        response = requests.post(
            f"{BASE_URL}/ai/lucresia/titulo",
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Títulos gerados!")
        print(f"   Contexto: {data.get('context')}")
        print(f"   Conteúdo:")
        for line in data.get('content', '').split('\n')[:5]:
            if line.strip():
                print(f"     {line}")
        
        return True
    except Exception as e:
        print(f"❌ Erro ao gerar títulos: {e}")
        return False

def test_templates():
    """Testa recuperação de templates"""
    print("\n🎨 Testando Templates...")
    try:
        response = requests.get(f"{BASE_URL}/templates", timeout=10)
        response.raise_for_status()
        templates = response.json()
        
        print(f"✅ {len(templates)} templates carregados")
        for template in templates[:3]:
            print(f"   - {template.get('name')} ({template.get('category')})")
        
        return True
    except Exception as e:
        print(f"❌ Erro ao carregar templates: {e}")
        return False

def wait_for_server(max_retries=MAX_RETRIES):
    """Aguarda servidor ficar disponível"""
    print("⏳ Aguardando servidor inicializar...")
    for attempt in range(max_retries):
        try:
            requests.get(f"{BASE_URL}/health", timeout=5)
            print("✅ Servidor disponível!")
            return True
        except:
            if attempt < max_retries - 1:
                print(f"   Tentativa {attempt + 1}/{max_retries}... aguardando {RETRY_DELAY}s")
                time.sleep(RETRY_DELAY)
    
    print(f"❌ Servidor não respondeu após {max_retries} tentativas")
    return False

def main():
    """Executa suite de testes"""
    print("=" * 60)
    print("🔥 TESTE DE FLUXO - Elevare NeuroVendas (BETA)")
    print("=" * 60)
    
    # Aguardar servidor
    if not wait_for_server():
        sys.exit(1)
    
    # Testes
    results = []
    
    results.append(("Health Check", test_health()))
    results.append(("Seed Brand Profile", seed_brand_profile()))
    
    brand_profile = get_brand_profile()
    results.append(("Get Brand Profile", brand_profile is not None))
    
    results.append(("Lucresia Stories", test_lucresia_stories(brand_profile)))
    results.append(("Lucresia Títulos", test_lucresia_titulo(brand_profile)))
    results.append(("Templates", test_templates()))
    
    # Resumo
    print("\n" + "=" * 60)
    print("📊 RESUMO DOS TESTES")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {test_name}")
    
    print(f"\nResultado: {passed}/{total} testes passaram")
    
    if passed == total:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        print("\n🚀 Fluxo pronto para BETA:")
        print("   1. Acesse http://localhost:3000")
        print("   2. Clique em '⚙️ Configurar Marca'")
        print("   3. Veja o perfil de marca carregado")
        print("   4. Crie designs e gere conteúdo com Lucresia!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} testes falharam. Verifique logs acima.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

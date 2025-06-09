
# Facebook Lead Ads Integration

## Overview

Esta integração processa leads diretamente dos formulários do Facebook Lead Ads, capturando automaticamente os dados do lead e parâmetros UTM do anúncio para armazenar na Kommo CRM.

## Configuração do Webhook no Facebook

### 1. Configurar Webhook no Facebook Business Manager

1. Acesse **Facebook Business Manager** > **Configurações** > **Webhooks**
2. Clique em **Adicionar Webhook**
3. Configure:
   - **URL do Webhook**: `https://seu-replit.com/webhook/utm-capture/dicasa`
   - **Eventos**: Selecione `leadgen`
   - **Token de Verificação**: Use qualquer token (ex: `facebook_webhook_verify_token`)

### 2. Verificação do Webhook

O Facebook enviará uma requisição GET para verificar o webhook:
```
GET /webhook/utm-capture/dicasa?hub.mode=subscribe&hub.challenge=123&hub.verify_token=facebook_webhook_verify_token
```

## Estrutura de Dados do Facebook Lead Ads

### Payload Recebido do Facebook

```json
{
  "object": "page",
  "entry": [
    {
      "id": "PAGE_ID",
      "time": 1234567890,
      "changes": [
        {
          "value": {
            "leadgen_id": "1234567890123456",
            "form_id": "987654321098765",
            "ad_id": "23847449619250XXX",
            "campaign_id": "23847449619180XXX",
            "adset_id": "23847449619210XXX",
            "field_data": [
              {
                "name": "email",
                "values": ["cliente@email.com"]
              },
              {
                "name": "full_name", 
                "values": ["João Silva"]
              },
              {
                "name": "phone_number",
                "values": ["+5511999887766"]
              }
            ],
            "utm_source": "facebook",
            "utm_medium": "social",
            "utm_campaign": "dicasa_primavera_2024",
            "utm_content": "carousel_imoveis",
            "utm_term": "apartamento_sao_paulo"
          },
          "field": "leadgen"
        }
      ]
    }
  ]
}
```

### Dados Extraídos e Processados

O sistema extrai e processa:

```json
{
  "facebook_leadgen_id": "1234567890123456",
  "kommo_lead_id": 12345,
  "lead_data": {
    "email": "cliente@email.com",
    "name": "João Silva",
    "phone": "+5511999887766"
  },
  "utm_data": {
    "utm_source": "facebook",
    "utm_medium": "social", 
    "utm_campaign": "dicasa_primavera_2024",
    "utm_content": "carousel_imoveis",
    "utm_term": "apartamento_sao_paulo"
  },
  "processed_at": "2024-01-15T10:30:00.000Z"
}
```

## Campos Mapeados no Kommo

### Lead Principal
- **Nome**: Extraído de `full_name` ou `first_name + last_name`
- **Email**: Campo obrigatório para Facebook events
- **Telefone**: Para enhanced matching

### Campos UTM Personalizados
- **UTM Source**: ID do campo `KOMMO_UTM_SOURCE_FIELD_ID`
- **UTM Medium**: ID do campo `KOMMO_UTM_MEDIUM_FIELD_ID`
- **UTM Campaign**: ID do campo `KOMMO_UTM_CAMPAIGN_FIELD_ID` (com prefixo `dicasa_`)
- **UTM Content**: ID do campo `KOMMO_UTM_CONTENT_FIELD_ID`
- **UTM Term**: ID do campo `KOMMO_UTM_TERM_FIELD_ID`

## Configuração de Campos no Facebook

### Campos Recomendados no Formulário

1. **Email** (obrigatório)
   ```json
   {
     "name": "email",
     "type": "email",
     "required": true
   }
   ```

2. **Nome Completo**
   ```json
   {
     "name": "full_name", 
     "type": "text",
     "required": true
   }
   ```

3. **Telefone** (opcional)
   ```json
   {
     "name": "phone_number",
     "type": "phone", 
     "required": false
   }
   ```

## Fluxo de Integração

1. **Cliente preenche formulário** no Facebook Lead Ad
2. **Facebook envia webhook** para `/webhook/utm-capture/dicasa`
3. **Sistema processa dados:**
   - Extrai informações do lead
   - Captura UTM parameters do anúncio
   - Adiciona prefixo `dicasa_` na campanha
4. **Cria lead na Kommo** com:
   - Dados pessoais do contato
   - Campos UTM preenchidos
   - Referência ao `leadgen_id` do Facebook
5. **Retorna confirmação** com IDs gerados

## Monitoramento e Logs

### Logs de Sucesso
```
[DICASA UTM SUCCESS] Facebook Lead 1234567890123456 - Lead criado na Kommo: 12345
UTM: source=facebook, medium=social, campaign=dicasa_primavera_2024
```

### Logs de Erro
```
[DICASA UTM ERROR] Facebook Lead 1234567890123456 - Erro na API Kommo: Invalid token
```

## Teste da Integração

### 1. Teste Manual via Webhook
```bash
curl -X POST https://seu-replit.com/webhook/utm-capture/dicasa \
  -H "Content-Type: application/json" \
  -d '{
    "leadgen_id": "test123",
    "form_id": "form123",
    "field_data": [
      {"name": "email", "values": ["teste@email.com"]},
      {"name": "full_name", "values": ["João Teste"]}
    ],
    "utm_source": "facebook",
    "utm_campaign": "teste_integracao"
  }'
```

### 2. Verificar na Kommo
- Lead criado com nome "João Teste"
- Email "teste@email.com" no contato
- Campos UTM preenchidos corretamente
- Campanha com prefixo: "dicasa_teste_integracao"

## Solução de Problemas

### Webhook não recebe dados
- Verificar URL do webhook no Facebook
- Confirmar token de verificação
- Validar permissões da página/app

### Erro ao criar lead na Kommo
- Verificar `KOMMO_API_TOKEN` válido
- Confirmar `KOMMO_ACCOUNT_DOMAIN` correto
- Validar IDs dos campos UTM personalizados

### UTM não sendo salvo
- Verificar se campos UTM existem na Kommo
- Confirmar IDs dos campos no `.env`
- Validar formato dos dados UTM

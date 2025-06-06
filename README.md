# Kommo + N8N + Facebook Ads Integration

🚀 **Projeto de integração automatizada entre Kommo CRM, N8N e Facebook Offline Conversions API**

## 📋 Objetivo do Projeto

Este projeto visa criar uma integração completa e automatizada que:

- ✅ **Captura automaticamente parâmetros UTM** de leads e armazena no Kommo CRM
- ✅ **Dispara eventos offline** para o Facebook Ads quando leads mudam de fase no funil
- ✅ **Automatiza fluxos** via N8N para máxima eficiência
- ✅ **Registra logs detalhados** e envia alertas automáticos em caso de falhas
- ✅ **Garante segurança** com hash SHA256 para dados sensíveis

## 🏗️ Visão Geral das Plataformas

### N8N (Automation Platform)
- **Função**: Orquestração de todos os fluxos automatizados
- **Deployment**: VPS com Docker ou N8N Cloud
- **Comunicação**: Webhooks e API REST calls

### Kommo CRM
- **Função**: Armazenamento de leads e dados UTM
- **Integração**: API REST v4
- **Campos customizados**: UTM parameters storage

### Facebook Offline Conversions API
- **Função**: Recebimento de eventos de conversão offline
- **Segurança**: Dados hasheados com SHA256
- **Tracking**: Attribution e performance measurement

## 🎯 Funcionalidades Detalhadas

### 1️⃣ Captura de UTM Parameters

**Fluxo**: `Lead UTM Capture to Kommo`

- **Trigger**: Webhook quando novo lead é criado
- **Captura**:
  - `utm_source` - Origem do tráfego
  - `utm_medium` - Meio de marketing
  - `utm_campaign` - Nome da campanha
  - `utm_content` - Conteúdo específico
  - `utm_term` - Termo de pesquisa
- **Ação**: Atualização automática dos campos customizados no Kommo

### 2️⃣ Eventos Offline para Facebook

**Fluxos Disponíveis**:
- `Offline Event Trigger - Atendimento`
- `Offline Event Trigger - Visita`
- `Offline Event Trigger - Lead Ganho`
- `Offline Event Trigger - Lead Perdido`

**Processo**:
1. **Trigger**: Mudança de status do lead no Kommo
2. **Processamento**: Hash SHA256 dos dados pessoais
3. **Envio**: Event para Facebook Offline Conversions API
4. **Logging**: Registro detalhado da operação

### 3️⃣ Sistema de Logs e Alertas

**Fluxo**: `Logs & Alerts - Offline Events Facebook`

- **Monitoramento**: Todos os envios para Facebook API
- **Alertas**: Notificações automáticas via Slack/Email em caso de falha
- **Logs**: Armazenamento local para auditoria e debugging

## 📁 Estrutura de Pastas

```
kommo-n8n-facebook-integration/
├── README.md                              # Documentação principal do projeto
├── .env.example                          # Template de variáveis de ambiente
├── server.js                             # Servidor de demonstração da integração
├── package.json                          # Dependências Node.js
├── docs/                                 # Documentação técnica
│   ├── architecture_diagram.md           # Diagrama de arquitetura
│   ├── utm_fields_mapping.md            # Mapeamento de campos UTM
│   ├── facebook_events_mapping.md       # Mapeamento de eventos Facebook
│   └── n8n_flows_description.md         # Descrição detalhada dos fluxos N8N
├── n8n-flows/                           # Fluxos N8N em formato JSON
│   ├── lead_utm_capture_mazi.json       # Captura UTM - Mazi
│   ├── lead_utm_capture_dicasa.json     # Captura UTM - DiCasa
│   ├── offline_event_trigger_atendimento.json   # Evento Atendimento
│   ├── offline_event_trigger_visita.json        # Evento Visita
│   ├── offline_event_trigger_lead_ganho.json    # Evento Lead Ganho
│   ├── offline_event_trigger_lead_perdido.json  # Evento Lead Perdido
│   └── logs_alerts_offline_events.json  # Sistema de logs e alertas
├── helpers/                             # Utilitários auxiliares
│   └── hash_utils.js                    # Funções de hash SHA256
├── config/                              # Configurações do sistema
│   ├── kommo_fields_mapping.json        # Configuração campos Kommo
│   └── facebook_events_config.json      # Configuração eventos Facebook
├── public/                              # Interface web de testes
│   └── test-interface.html              # Interface de testes interativa
└── logs/                                # Logs do sistema
    ├── utm_capture.log                  # Logs de captura UTM
    ├── offline_events.log               # Logs de eventos Facebook
    └── errors.log                       # Logs de erros

```

## 🔧 Configuração Rápida

### 1. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure suas credenciais:

```bash
# Kommo CRM
KOMMO_ACCOUNT_DOMAIN=sua-conta.kommo.com
KOMMO_API_TOKEN=seu_token_kommo
KOMMO_UTM_SOURCE_FIELD_ID=123456
KOMMO_UTM_MEDIUM_FIELD_ID=123457
KOMMO_UTM_CAMPAIGN_FIELD_ID=123458
KOMMO_UTM_CONTENT_FIELD_ID=123459
KOMMO_UTM_TERM_FIELD_ID=123460

# Facebook API
FACEBOOK_ACCESS_TOKEN=seu_facebook_access_token
FACEBOOK_AD_ACCOUNT_ID=act_1234567890
TEST_EVENT_CODE=TEST12345

# Slack (Opcional)
SLACK_BOT_TOKEN=xoxb-seu-slack-bot-token
SLACK_CHANNEL_ID=C1234567890
```

### 2. Configurar Campos Customizados no Kommo

Crie os seguintes campos personalizados no seu Kommo CRM:
- **UTM Source** (Texto)
- **UTM Medium** (Texto)  
- **UTM Campaign** (Texto)
- **UTM Content** (Texto)
- **UTM Term** (Texto)

### 3. Importar Fluxos no N8N

1. Acesse sua instância N8N
2. Importe os arquivos JSON da pasta `n8n-flows/`
3. Configure as credenciais nos nós HTTP Request
4. Ative os fluxos

### 4. Testar a Integração

Execute o servidor de demonstração:
```bash
npm install
npm start
```

Acesse `http://localhost:5000` para a interface de testes.

## 🎯 Guia de Uso

### Captura de UTM Parameters

**Endpoint:** `POST /webhook/utm-capture/{system}`

```json
{
  "lead_id": "12345",
  "utm_source": "google",
  "utm_medium": "cpc", 
  "utm_campaign": "spring_sale_2024",
  "utm_content": "ad_variant_a",
  "utm_term": "real+estate+miami"
}
```

### Eventos Offline Facebook

**Atendimento (InitiateContact):**
```json
{
  "lead_id": "12345",
  "email": "cliente@email.com",
  "phone": "+55 11 99999-9999",
  "first_name": "João",
  "last_name": "Silva",
  "utm_source": "facebook",
  "utm_campaign": "mazi_spring_2024"
}
```

**Lead Ganho (Purchase):**
```json
{
  "lead_id": "12345", 
  "email": "cliente@email.com",
  "deal_value": 350000,
  "deal_type": "residential_sale",
  "property_type": "apartment"
}
```

## 🔒 Segurança e Hash SHA256

O sistema implementa hash SHA256 para todos os dados pessoais enviados ao Facebook:

```javascript
// Exemplo de hash de dados pessoais
const hashedData = {
  em: [hashSha256("cliente@email.com")],     // Email
  ph: [hashSha256("5511999999999")],         // Telefone (só números)
  fn: [hashSha256("joão")],                  // Nome (lowercase)
  ln: [hashSha256("silva")]                  // Sobrenome (lowercase)
};
```

**Características do Hash:**
- Algoritmo SHA256
- Normalização: trim() + toLowerCase()
- Telefones: apenas dígitos
- Conformidade GDPR/CCPA

## 📊 Monitoramento e Logs

### Sistema de Alertas

O sistema envia alertas automáticos para Slack quando:
- ❌ Falhas na API do Facebook
- ⚠️ Erros de validação de dados
- 🚨 Problemas críticos de autenticação
- 📉 Taxa de sucesso abaixo do esperado

### Logs Detalhados

Todos os eventos são registrados com informações completas:
- ✅ **Sucessos:** UTM capturado, evento enviado
- ❌ **Erros:** Falhas de API, validação, conectividade
- 📈 **Métricas:** Taxa de sucesso, tempo de resposta

## 🧪 Interface de Testes

Acesse `http://localhost:5000/test-interface.html` para:

- 🔧 **Testar Captura UTM:** Simular captura de parâmetros
- 📱 **Testar Eventos Facebook:** Enviar eventos de teste
- 🏥 **Health Check:** Verificar status do sistema
- 🔐 **Demo Hash:** Visualizar processo de hash SHA256
- 💬 **Teste Slack:** Verificar notificações

## 🎯 Casos de Uso

### Cenário Real - Lead Mazi

1. **Lead chega via Google Ads:**
   ```
   UTM: source=google, medium=cpc, campaign=mazi_primavera
   ```

2. **Sistema captura automaticamente:**
   - Armazena UTM no Kommo
   - Adiciona prefixo "mazi_" na campanha

3. **Lead avança no pipeline:**
   - **Atendimento:** Evento `InitiateContact` → Facebook
   - **Visita:** Evento `Schedule` → Facebook  
   - **Fechamento:** Evento `Purchase` → Facebook (com valor da venda)

4. **Facebook otimiza campanhas:**
   - Identifica qual UTM gerou conversão
   - Melhora targeting baseado em dados reais

## 🚀 Deployment

### N8N Cloud
1. Importe os workflows JSON
2. Configure credenciais
3. Ative webhooks

### N8N Self-Hosted (Docker)
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

### Webhooks URLs
- UTM Mazi: `https://sua-n8n.com/webhook/utm_capture_mazi`
- UTM DiCasa: `https://sua-n8n.com/webhook/utm_capture_dicasa`
- Facebook Events: `https://sua-n8n.com/webhook/facebook_event_{tipo}`

## ✅ Checklist de Implementação

### Kommo CRM
- [ ] Campos UTM criados
- [ ] API token configurado
- [ ] IDs dos campos atualizados no .env

### Facebook API  
- [ ] Access Token obtido
- [ ] Ad Account ID configurado
- [ ] Test Event Code configurado
- [ ] Permissões de Offline Events ativas

### N8N
- [ ] Workflows importados
- [ ] Credenciais configuradas
- [ ] Webhooks testados
- [ ] Logs funcionando

### Slack (Opcional)
- [ ] Bot criado no workspace
- [ ] Token configurado
- [ ] Canal de alertas definido

### Testes
- [ ] Captura UTM funcionando
- [ ] Eventos Facebook sendo enviados
- [ ] Hash SHA256 validado
- [ ] Alertas Slack ativos

## 🔧 Troubleshooting

### Erros Comuns

**1. "Invalid OAuth Access Token"**
- Verificar se FACEBOOK_ACCESS_TOKEN está correto
- Confirmar permissões de Offline Events
- Regenerar token se necessário

**2. "Lead ID not found in Kommo"**
- Validar se lead_id existe no Kommo
- Verificar credenciais da API Kommo
- Confirmar endpoint do Kommo

**3. "UTM fields not updating"**
- Verificar IDs dos campos customizados
- Confirmar se campos existem no Kommo
- Validar formato JSON do payload

### Logs de Debug

```bash
# Verificar logs do servidor
tail -f logs/utm_capture.log
tail -f logs/offline_events.log
tail -f logs/errors.log
```

## 📞 Suporte

Para dúvidas técnicas:
1. Verificar logs de erro
2. Testar endpoints individuais
3. Validar configurações de API
4. Consultar documentação das APIs:
   - [Kommo API Docs](https://www.kommo.com/developers/api/)
   - [Facebook Offline Events API](https://developers.facebook.com/docs/marketing-api/offline-events/)
   - [N8N Documentation](https://docs.n8n.io/)

## 🏆 Resultados Esperados

Com esta integração implementada, você terá:

✅ **100% dos leads com UTM** capturados automaticamente  
✅ **Rastreamento completo** do funil no Facebook Ads  
✅ **Otimização de campanhas** baseada em dados reais de conversão  
✅ **Alertas automáticos** para falhas críticas  
✅ **Conformidade GDPR/CCPA** com hash SHA256  
✅ **ROI melhorado** através de attribution precisa

---

**Desenvolvido para:** Integração Kommo + N8N + Facebook Ads  
**Versão:** 1.0  
**Última atualização:** Janeiro 2024


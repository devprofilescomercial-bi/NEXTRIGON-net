import Link from "next/link"

export default function PrivacidadePage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px", color: "#f8fafc", fontSize: 15, lineHeight: 1.7 }}>
      <Link href="/" style={{ color: "#f97316", fontSize: 14, textDecoration: "none", display: "inline-block", marginBottom: 20 }}>← Voltar</Link>

      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Política de Privacidade</h1>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 24 }}>Última atualização: 15 de junho de 2026 — Versão 1.0</p>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>1. Quem somos</h2>
        <p>A Nextrigon é uma plataforma de conexão entre profissionais jurídicos. Esta política descreve como tratamos seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>2. Dados que coletamos</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Identificação:</strong> nome, email, telefone</li>
          <li><strong>Profissional:</strong> número OAB, UF de inscrição, áreas de atuação</li>
          <li><strong>Localização:</strong> cidade, UF, coordenadas GPS (com consentimento)</li>
          <li><strong>Biométrico:</strong> selfie para verificação facial</li>
          <li><strong>Navegação:</strong> dados de uso da plataforma</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>3. Finalidade do tratamento</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>Criar e gerenciar sua conta na plataforma</li>
          <li>Verificar sua identidade profissional (OAB)</li>
          <li>Recomendar profissionais compatíveis via algoritmo de match</li>
          <li>Permitir comunicação entre usuários (chat)</li>
          <li>Cumprir obrigações legais e regulatórias</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>4. Base legal (art. 7º LGPD)</h2>
        <p>Utilizamos as seguintes bases legais para tratamento dos seus dados:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Consentimento (art. 7º, I):</strong> para dados biométricos (selfie) e localização GPS</li>
          <li><strong>Execução de contrato (art. 7º, V):</strong> para funcionamento da plataforma e match</li>
          <li><strong>Obrigação legal (art. 7º, II):</strong> para verificação OAB e compliance</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>5. Compartilhamento de dados</h2>
        <p>Compartilhamos seus dados apenas com:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>Outros profissionais da plataforma (perfil público)</li>
          <li>Provedores de infraestrutura (hosting, banco de dados)</li>
          <li>Autoridades competentes, quando exigido por lei</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>6. Seus direitos (art. 18º LGPD)</h2>
        <p>Você pode, a qualquer momento:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Exportar</strong> seus dados — use o endpoint <code>/api/users/me/export</code></li>
          <li><strong>Corrigir</strong> seus dados — edite seu perfil</li>
          <li><strong>Excluir</strong> sua conta — use <code>DELETE /api/users/me</code> (dados anonimizados)</li>
          <li><strong>Revogar</strong> consentimento — ajuste nas configurações</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>7. Retenção de dados</h2>
        <p>Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da conta, os dados são anonimizados em até 30 dias. Dados obrigatórios por lei (ex: registros de verificação OAB) podem ser retidos por até 5 anos conforme legislação aplicável.</p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>8. Segurança</h2>
        <p>Adotamos medidas técnicas e organizacionais para proteger seus dados:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li>Criptografia de senhas com bcrypt</li>
          <li>Tokens JWT com expiração</li>
          <li>Comunicação via HTTPS</li>
          <li>Controle de acesso baseado em roles (RBAC)</li>
          <li>Registro de operações com dados sensíveis (audit log)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>9. Cookies</h2>
        <p>Utilizamos cookies essenciais para autenticação e funcionamento da plataforma. Não utilizamos cookies de rastreamento ou publicidade.</p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>10. Contato</h2>
        <p>Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato pelo email: <strong style={{ color: "#f97316" }}>lgpd@nextrigon.com</strong></p>
      </section>

      <div style={{ borderTop: "1px solid #334155", paddingTop: 16, marginTop: 32 }}>
        <p style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>
          Nextrigon — Marketplace Jurídico. CNPJ: 00.000.000/0001-00
        </p>
      </div>
    </main>
  )
}

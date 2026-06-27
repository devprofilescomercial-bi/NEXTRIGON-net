"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

const TOPICOS = [
  { title: "Dados que coletamos", body: "Nome, e-mail, foto de perfil, localização (cidade/UF), áreas de atuação, número OAB e selfie de verificação. Nenhuma informação de clientes ou processos é armazenada." },
  { title: "Como usamos seus dados", body: "Para exibir seu perfil, recomendar matches compatíveis, verificar identidade profissional via OAB e enviar notificações sobre conexões." },
  { title: "Compartilhamento", body: "Não vendemos dados. Compartilhamos apenas com provedores essenciais (banco de dados, armazenamento) sob contratos de confidencialidade." },
  { title: "Retenção", body: "Dados mantidos enquanto conta estiver ativa. Após exclusão, dados pessoais removidos em até 30 dias, exceto logs exigidos por lei." },
  { title: "Seus direitos (LGPD art. 18)", body: "Acesso, correção, exportação e exclusão dos seus dados; revogação de consentimento; informação clara sobre o uso." },
];

export default function PrivacidadePage() {
  const router = useRouter();
  const [exportando, setExportando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function exportarDados() {
    setExportando(true);
    try {
      const res = await fetch("/api/perfil/exportar", { credentials: "include" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "nextrigon-meus-dados.json"; a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erro ao exportar. Tente novamente.");
    } finally {
      setExportando(false);
    }
  }

  async function excluirConta() {
    if (!confirmar) { setConfirmar(true); return; }
    setExcluindo(true);
    try {
      await fetch("/api/perfil/excluir", { method: "DELETE", credentials: "include" });
      await signOut();
      router.replace("/login");
    } catch {
      alert("Erro ao excluir conta. Contato: privacidade@nextrigon.com.br");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
      <div className="mt-1 mb-5 flex items-center gap-3">
        <button onClick={() => router.back()} className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <div>
          <h1 className="text-xl font-bold">Privacidade e dados</h1>
          <p className="text-[11px] text-muted">Conformidade LGPD</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {TOPICOS.map(t => (
          <div key={t.title} className="glass rounded-2xl p-4">
            <h2 className="font-semibold text-sm mb-1.5">{t.title}</h2>
            <p className="text-xs text-muted leading-relaxed">{t.body}</p>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-muted mb-3">Ações disponíveis</h2>
      <div className="flex flex-col gap-3">
        <button onClick={exportarDados} disabled={exportando}
          className="glass-soft rounded-2xl border border-line px-4 py-3.5 text-left disabled:opacity-60">
          <span className="block text-sm font-semibold">{exportando ? "Exportando…" : "Exportar meus dados"}</span>
          <span className="text-xs text-muted">Baixa um JSON com todos os seus dados cadastrados</span>
        </button>

        <button onClick={excluirConta} disabled={excluindo}
          className={`rounded-2xl border px-4 py-3.5 text-left transition ${confirmar ? "border-danger/60 bg-danger/10" : "glass-soft border-danger/20"}`}>
          <span className={`block text-sm font-semibold ${confirmar ? "text-danger" : "text-danger/70"}`}>
            {excluindo ? "Excluindo…" : confirmar ? "Confirmar exclusão permanente" : "Excluir minha conta"}
          </span>
          <span className="text-xs text-muted">
            {confirmar ? "Esta ação não pode ser desfeita. Clique para confirmar." : "Remove todos os seus dados permanentemente"}
          </span>
        </button>

        {confirmar && (
          <button onClick={() => setConfirmar(false)} className="text-center text-xs text-dim py-1">Cancelar</button>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] text-dim">
        Dúvidas: <a href="mailto:privacidade@nextrigon.com.br" className="underline">privacidade@nextrigon.com.br</a>
      </p>
    </section>
  );
}

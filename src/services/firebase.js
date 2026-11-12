// Inicialização do Firebase para a página pública — SOMENTE LEITURA.
// Não use firebase-admin nem credenciais de conta de serviço neste projeto.
// Os módulos são carregados sob demanda, então com FONTE_DADOS = "sheets"
// o SDK do Firebase nem é baixado pelo navegador.

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || undefined, // opcional
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// App Check (opcional, desligado por padrão). Ver firestore.rules.sugestao.
const APP_CHECK_ATIVO = env.VITE_APP_CHECK_ATIVO === "true";
const RECAPTCHA_SITE_KEY = env.VITE_RECAPTCHA_SITE_KEY;
// "v3" (ReCaptchaV3Provider) ou "enterprise" (ReCaptchaEnterpriseProvider)
const RECAPTCHA_TIPO = env.VITE_RECAPTCHA_TIPO || "v3";

let dbPromise = null;

async function inicializar() {
  const faltando = ["apiKey", "projectId", "appId"].filter((k) => !firebaseConfig[k]);
  if (faltando.length) {
    throw new Error(`Configuração do Firebase incompleta (${faltando.join(", ")}). Confira o .env.`);
  }

  const { initializeApp } = await import("firebase/app");
  const app = initializeApp(firebaseConfig);

  if (APP_CHECK_ATIVO) {
    if (!RECAPTCHA_SITE_KEY) {
      console.warn("App Check ativado sem VITE_RECAPTCHA_SITE_KEY; ignorando.");
    } else {
      const { initializeAppCheck, ReCaptchaV3Provider, ReCaptchaEnterpriseProvider } =
        await import("firebase/app-check");
      const Provider = RECAPTCHA_TIPO === "enterprise" ? ReCaptchaEnterpriseProvider : ReCaptchaV3Provider;
      initializeAppCheck(app, {
        provider: new Provider(RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
    }
  }

  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(app);
}

export function obterDb() {
  if (!dbPromise) {
    dbPromise = inicializar().catch((erro) => {
      dbPromise = null; // permite nova tentativa
      throw erro;
    });
  }
  return dbPromise;
}

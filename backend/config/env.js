import "dotenv/config";

const _checked = [];

function def(name, fallback) {
  _checked.push(name);
  return process.env[name] ?? fallback;
}

export const port = parseInt(def("PORT", "5000"), 10);
export const mongoUri = def(
  "MONGO_URI",
  "mongodb://localhost:27017/kady-hiring-portal",
);
export const jwtSecret = def(
  "JWT_SECRET",
  "kady-admin-secret-key-change-in-production",
);
export const smtp = {
  host: def("SMTP_HOST"),
  port: parseInt(def("SMTP_PORT", "587"), 10),
  user: def("SMTP_USER"),
  pass: def("SMTP_PASS"),
  from: def("SMTP_FROM") || def("SMTP_USER") || "noreply@kady.local",
};
export const nodeEnv = def("NODE_ENV", "development");
export const isProd = nodeEnv === "production";
export const isDev = nodeEnv !== "production";
export const admin = {
  name: def("ADMIN_NAME"),
  email: def("ADMIN_EMAIL"),
  password: def("ADMIN_PASSWORD"),
  mobile: def("ADMIN_MOBILE"),
};

// Validate after all def() calls have registered
const _missing = _checked.filter((k) => !(k in process.env));
if (_missing.length) {
  // eslint-disable-next-line no-console
  console.warn(`⚠️  [env] Missing env vars: ${_missing.join(", ")}`);
}

const env = { port, mongoUri, jwtSecret, smtp, nodeEnv, isProd, isDev,admin };
export { env };
export default env;

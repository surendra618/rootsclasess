import app from '../Backend/App.js';

export default function handler(req, res) {
  return app(req, res);
}

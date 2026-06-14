// Draft-feed auth validator for nginx `auth_request`.
//
// nginx calls this for every request to /_drafts/* on a chapter or the main site.
// We pull the `lt_id` (Cognito id_token) cookie, ask the app API "who is this?"
// (GET /me — which re-verifies the token via the API Gateway Cognito authorizer and
// returns the caller's per-chapter memberships), and allow ONLY an organizer/leader
// of the requested chapter (or a global admin). 200 → nginx serves the gated file;
// anything else → nginx returns 401/403 and the public never sees a draft.
//
// Reuses the API Gateway authorizer for token verification — no JWKS handling here.
import http from 'node:http';

const PORT = Number(process.env.PORT || 9002);
const API = process.env.LT_API || 'https://hdfjlrjjxh.execute-api.us-east-1.amazonaws.com';

// Which chapter a host's /_drafts/ feed belongs to. Hosts not listed (lunatechs.social,
// www) serve the MERGED global drafts feed → any staff (organizer/leader/admin) may see it.
const HOST_CHAPTER = {
  'hk.lunatechs.social': 'hongkong',
  'sg.lunatechs.social': 'singapore',
  'la.lunatechs.social': 'losangeles',
};

function readCookie(header, name) {
  const m = (header || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

const server = http.createServer(async (req, res) => {
  const deny = (code, msg) => res.writeHead(code, { 'Content-Type': 'text/plain' }).end(msg);
  try {
    const host = (req.headers['x-original-host'] || '').toLowerCase().split(':')[0];
    const token = readCookie(req.headers.cookie, 'lt_id');
    if (!token) return deny(401, 'no session');

    const r = await fetch(API + '/me', { headers: { Authorization: 'Bearer ' + token } });
    if (!r.ok) return deny(401, 'bad session');
    const me = await r.json();

    const chapter = HOST_CHAPTER[host]; // undefined → global/main site (merged feed)
    const chapters = Array.isArray(me.chapters) ? me.chapters : [];
    const ok = me.isAdmin
      ? true
      : chapter ? chapters.includes(chapter)   // chapter site: must be staff of THIS chapter
                : chapters.length > 0;          // global page: any staff
    return ok ? res.writeHead(200).end('ok') : deny(403, 'forbidden');
  } catch (e) {
    return deny(401, 'error'); // fail closed — never serve a draft on an error
  }
});

server.listen(PORT, '127.0.0.1', () => console.log(`draft-auth listening on 127.0.0.1:${PORT}`));

# jupyterhub-ga

Extensão JupyterLab oculta que carrega o Google Analytics (`gtag`) após o login, no Lab:

`https://jupyter.linea.org.br/user/<username>/lab`

Sem menu, comando, painel ou Settings. Envia um `page_view` com path sanitizado (`/user/{user}/...`), sem username.

Repo: [linea-it/jupyterhub-ga](https://github.com/linea-it/jupyterhub-ga)

## O que cobre

| Cobre | Não cobre |
|-------|-----------|
| JupyterLab (`/user/.../lab`) | Hub (`/hub/...`) |
| | Notebook clássico / nbclassic (`/tree`, etc.) |
| | EDS |

O clássico fica de fora por enquanto.

## Measurement ID

(em `linea_ga_lab/src/index.ts`)

Não é segredo: aparece no browser de quem usa o Lab. Variável de ambiente só faria sentido com IDs diferentes por ambiente. Abuso se controla no Admin do GA (domínios, filtros).

## Instalação

Baixe o `.whl` do [release](https://github.com/linea-it/jupyterhub-ga/releases).

```bash
pip install linea_ga-0.1.0-py3-none-any.whl
```

Instala em `$PREFIX/share/jupyter/labextensions/linea-ga/`.

No JupyterLab 4, rode `jupyter lab build` se o ambiente tiver Node.js.

Não há extensão de servidor (`jpserver_extensions`).

## Docker

```dockerfile
ARG WHEEL_URL=https://github.com/linea-it/jupyterhub-ga/releases/download/v0.1.0/linea_ga-0.1.0-py3-none-any.whl

RUN curl -f -L -o /tmp/linea_ga-0.1.0-py3-none-any.whl "${WHEEL_URL}" \
    && python3 -c "import zipfile; zipfile.ZipFile('/tmp/linea_ga-0.1.0-py3-none-any.whl')" \
    || (echo "Wheel inválido. Confira WHEEL_URL." && exit 1)

USER jovyan
RUN pip install --no-cache-dir /tmp/linea_ga-0.1.0-py3-none-any.whl
USER root
```

Após o deploy, no DevTools > Network do Lab deve aparecer `gtag/js?id=G-NNNNNNNNNN`.

## Release

1. Atualize `version` em `pyproject.toml` e `linea_ga_lab/package.json`.
2. Push e crie um Release no GitHub com tag `v0.1.0`.
3. O workflow **Build wheel** gera o `.whl` e anexa aos Assets.

## Privacidade

- `send_page_view` automático desligado
- Path com username substituído por `{user}`
- Sem query string, tokens ou PII nos eventos

## Estrutura

| Pasta | Descrição |
|-------|-----------|
| `linea_ga/` | Pacote Python (empacota o wheel) |
| `linea_ga_lab/` | Extensão frontend (`linea-ga`) |
| `.github/workflows/release.yml` | CI do `.whl` |

O Dockerfile da imagem e a tag do Hub ficam no deploy do JupyterHub, não neste repo.

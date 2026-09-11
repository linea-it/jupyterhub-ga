# jupyterhub-ga

Extensão JupyterLab oculta que carrega o Google Analytics (`gtag`) após o login, no Lab:

`https://jupyter.linea.org.br/user/<username>/lab`

Sem menu, comando, painel ou Settings. Envia um `page_view` genérico (`/user/{user}/lab`), sem username nem path de notebook/arquivo. Diferencia visitantes pelo `client_id` anônimo do GA. Opcionalmente envia `linea_jh_image` (nome da imagem JupyterHub).

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
pip install linea_ga-0.1.2-py3-none-any.whl
```

Instala em `$PREFIX/share/jupyter/labextensions/linea-ga/`.

No JupyterLab 4, rode `jupyter lab build` se o ambiente tiver Node.js.

Não há extensão de servidor (`jpserver_extensions`).

Para identificar a imagem no GA4, configure page config (lido via `PageConfig.getOption('linea_jh_image')`):

```dockerfile
RUN echo "c.LabApp.page_config_data = {'linea_jh_image': 'solarsystem'}" \
    >> /opt/conda/etc/jupyter/jupyter_lab_config.py
```

No GA4: Admin → Dimensões personalizadas → parâmetro de evento `linea_jh_image` (escopo Evento).

## Docker

```dockerfile
ARG WHEEL_URL=https://github.com/linea-it/jupyterhub-ga/releases/download/v0.1.2/linea_ga-0.1.2-py3-none-any.whl

RUN curl -f -L -o /tmp/linea_ga-0.1.2-py3-none-any.whl "${WHEEL_URL}" \
    && python3 -c "import zipfile; zipfile.ZipFile('/tmp/linea_ga-0.1.2-py3-none-any.whl')" \
    || (echo "Wheel inválido. Confira WHEEL_URL." && exit 1)

USER jovyan
RUN pip install --no-cache-dir /tmp/linea_ga-0.1.2-py3-none-any.whl
USER root
```

Após o deploy, no DevTools > Network do Lab deve aparecer `gtag/js?id=G-NNNNNNNNNN` e um `/g/collect` com path genérico.

## Release

1. Atualize `version` em `pyproject.toml` e `linea_ga_lab/package.json`.
2. Push e crie um Release no GitHub com tag `v0.1.2`.
3. O workflow **Build wheel** gera o `.whl` e anexa aos Assets.

## Privacidade

- Diferencia usuários só pelo `client_id` do GA (anônimo), **sem** username
- Path fixo `/user/{user}/lab` — sem notebooks, pastas ou nomes de arquivo
- `page_title` fixo `JupyterLab`
- `send_page_view` automático desligado; `page_*` forçados via `gtag('set', …)`
- Sem query string, tokens ou PII nos eventos
- Recomendado no Admin GA4: em Enhanced Measurement, desligar **alterações de página baseadas no histórico** (evita URLs cheias em hits automáticos)
- `linea_jh_image` identifica a *imagem* (solarsystem, astronomy, …), não a pessoa

## Estrutura

| Pasta | Descrição |
|-------|-----------|
| `linea_ga/` | Pacote Python (empacota o wheel) |
| `linea_ga_lab/` | Extensão frontend (`linea-ga`) |
| `.github/workflows/release.yml` | CI do `.whl` |

O Dockerfile da imagem e a tag do Hub ficam no deploy do JupyterHub, não neste repo.

# Migration vers Trusted Publishers npm

## Vue d'ensemble

Ce document décrit la migration du package `graneet-form` vers l'authentification par Trusted Publishers (OIDC) pour la publication sur npm.

## Contexte

Les Trusted Publishers permettent de publier des packages npm sans utiliser de tokens longue durée, en utilisant l'authentification OpenID Connect (OIDC) directement depuis GitHub Actions.

### Avantages

- 🔒 **Sécurité améliorée** : Élimination des tokens longue durée
- 📜 **Provenance automatique** : Preuve cryptographique de l'origine du package
- 🔄 **Gestion simplifiée** : Plus besoin de gérer/renouveler les tokens
- ⭐ **Standard OpenSSF** : Recommandé par l'Open Source Security Foundation

## Configuration requise

### Prérequis

- npm CLI >= 11.5.1
- GitHub Actions avec permission `id-token: write`
- Configuration Trusted Publisher sur npmjs.com

### Versions utilisées

- Node.js: v20
- npm: v11.x (mise à jour depuis v10.x)
- pnpm: v10
- GitHub Actions: ubuntu-latest

## Étapes de migration

### Étape 1 : Configuration sur npmjs.com

⚠️ **IMPORTANT** : Cette étape doit être effectuée AVANT de merger les changements.

1. Se connecter sur https://npmjs.com
2. Aller sur https://www.npmjs.com/package/graneet-form/access
3. Dans la section "Trusted Publisher", cliquer sur **GitHub Actions**
4. Remplir les champs :
   - **Organization or user**: `graneet`
   - **Repository**: `graneet-form`
   - **Workflow filename**: `release.yml`
   - **Environment name**: (laisser vide)
5. Cliquer sur **Save**

### Étape 2 : Modifications du workflow GitHub Actions

Les modifications suivantes ont été apportées à `.github/workflows/release.yml` :

#### 2.1 Ajout des permissions OIDC

```yaml
permissions:
  contents: write      # Pour créer des releases/tags
  pull-requests: write # Pour changesets PR
  id-token: write      # Pour OIDC authentication
```

#### 2.2 Mise à jour npm vers v11

```yaml
- name: Update npm to v11
  run: npm install -g npm@latest
  shell: bash
```

#### 2.3 Configuration du registry npm

```yaml
- name: Setup npm registry
  uses: actions/setup-node@v5
  with:
    node-version: 20
    registry-url: 'https://registry.npmjs.org'
```

#### 2.4 Vérification OIDC (pour debug)

```yaml
- name: Check OIDC and npm configuration
  run: |
    echo "🔍 Environment check:"
    echo "Node version: $(node --version)"
    echo "npm version: $(npm --version)"
    echo "pnpm version: $(pnpm --version)"
    if [ -n "$ACTIONS_ID_TOKEN_REQUEST_URL" ]; then
      echo "✅ OIDC is available"
    else
      echo "❌ OIDC is NOT available"
    fi
  shell: bash
```

### Étape 3 : Tests en dry-run

Avant de publier réellement, le workflow a été testé avec `--dry-run` :

```yaml
publish: pnpm release -- --dry-run
```

#### Vérifications effectuées

Dans les logs GitHub Actions, vérifier :

✅ **Étape "Check OIDC and npm configuration"** :
```
🔍 Environment check:
Node version: v20.x.x
npm version: v11.x.x (doit être >= 11.5.1)
pnpm version: 10.x.x
✅ OIDC is available
```

✅ **Étape "Create Release Pull Request or Publish to npm"** :
- Rechercher dans les logs : "Using OIDC token" ou "Authenticated via OIDC"
- Vérifier qu'il n'y a pas d'erreur "Unable to authenticate"
- Le dry-run devrait afficher : "npm notice Publishing to https://registry.npmjs.org/ with tag latest and default access (dry-run)"

#### Erreurs possibles et solutions

| Erreur | Cause probable | Solution |
|--------|---------------|----------|
| "Unable to authenticate" | Configuration Trusted Publisher incorrecte sur npmjs.com | Vérifier les champs (casse, nom exact du fichier) |
| "OIDC is NOT available" | Permission `id-token: write` manquante | Vérifier le workflow |
| npm version < 11.5.1 | Mise à jour npm non effectuée | Vérifier l'étape "Update npm to v11" |
| "npm ERR! need auth" | OIDC non détecté, fallback sur token | Vérifier la configuration du registry |

### Étape 4 : Finalisation

Une fois les tests concluants :

1. **Retirer le `--dry-run`** du workflow
2. **Retirer le trigger temporaire** de la branche de test
3. **Supprimer `NPM_TOKEN`** de la section `env` (après validation complète)
4. **Merger** la branche dans `main`

#### 4.1 Modification du workflow pour publication réelle

```yaml
- name: Create Release Pull Request or Publish to npm
  id: changesets
  uses: changesets/action@v1
  with:
    publish: pnpm release  # Retirer le -- --dry-run
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    # NPM_TOKEN retiré après validation
```

#### 4.2 Retrait du trigger temporaire

```yaml
on:
  push:
    branches:
      - main
      # Retirer : - feature/trusted-publishers-setup
```

### Étape 5 : Sécurisation maximale

⚠️ **ATTENTION** : Ces actions rendent impossible toute publication via token.

#### 5.1 Sur npmjs.com

1. Aller dans **Settings** → **Publishing access**
2. Sélectionner **"Require two-factor authentication and disallow tokens"**
3. Cliquer sur **"Update Package Settings"**

#### 5.2 Sur GitHub

1. Aller dans **Settings** → **Secrets and variables** → **Actions**
2. Supprimer le secret `NPM_TOKEN`

## Vérification de la provenance

Après la première publication via Trusted Publishers :

1. Visiter https://www.npmjs.com/package/graneet-form
2. Vérifier la présence du badge **"Provenance"**
3. Cliquer dessus pour voir les détails :
   - Repository source : `graneet/graneet-form`
   - Commit SHA
   - Workflow utilisé : `release.yml`
   - Build transparency log

Exemple de badge de provenance :
```
✓ Provenance
  Built and signed on GitHub Actions
  Learn more about provenance
```

## Rollback

Si nécessaire, pour revenir en arrière :

### Rollback immédiat (avant désactivation des tokens)

1. **Revert le commit du workflow** :
   ```bash
   git revert <commit-sha>
   git push
   ```

2. Le `NPM_TOKEN` est toujours présent dans les secrets, les publications continueront

### Rollback après désactivation des tokens

1. **Sur npmjs.com** :
   - Settings → Publishing access
   - Réactiver "Allow tokens"
   
2. **Créer un nouveau NPM_TOKEN** :
   - npmjs.com → Access Tokens → Generate New Token
   - Type: "Automation" avec scope limité au package
   
3. **Ajouter le token sur GitHub** :
   - GitHub → Settings → Secrets → New secret
   - Name: `NPM_TOKEN`, Value: [le nouveau token]

4. **Revert les changements du workflow**

5. **Supprimer la configuration Trusted Publisher** sur npmjs.com

## Ressources

- [Documentation npm Trusted Publishers](https://docs.npmjs.com/trusted-publishers)
- [GitHub OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [OpenSSF Trusted Publishers](https://repos.openssf.org/trusted-publishers-for-all-package-repositories)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)

---

**Date de migration** : Décembre 2024  
**Auteur** : Victor Duclos  
**Status** : ✅ En cours de migration

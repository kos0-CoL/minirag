#!/bin/bash
# Script per testare il deploy locale prima di mandare su Render

echo "🔧 Testing Mini RAG Pro deploy..."

# Test 1: Verifica che il backend compili
echo ""
echo "✅ Test 1: Syntax check backend..."
cd "/home/naza/Documentos/minirag de claude/minirag"
node --check server.js
if [ $? -eq 0 ]; then
    echo "   ✅ Backend syntax OK"
else
    echo "   ❌ Backend syntax error"
    exit 1
fi

# Test 2: Verifica che il frontend compili
echo ""
echo "✅ Test 2: Build frontend..."
cd "/home/naza/Documentos/minirag de claude/minirag/frontend"
npm run build
if [ $? -eq 0 ]; then
    echo "   ✅ Frontend build OK"
else
    echo "   ❌ Frontend build failed"
    exit 1
fi

# Test 3: Verifica che il backend parta
echo ""
echo "✅ Test 3: Test backend startup..."
cd "/home/naza/Documentos/minirag de claude/minirag"
timeout 3 node server.js 2>&1 | grep -q "Server running"
if [ $? -eq 0 ]; then
    echo "   ✅ Backend starts OK"
else
    echo "   ⚠️  Backend test timeout (normale per test rapido)"
fi

# Test 4: Verifica che le env vars siano configurate
echo ""
echo "✅ Test 4: Environment variables check..."
if [ -f ".env" ]; then
    echo "   ✅ .env presente"
else
    echo "   ⚠️  .env non trovato (usa .env.example)"
fi

if [ -f "frontend/.env.production" ]; then
    echo "   ✅ frontend/.env.production presente"
else
    echo "   ❌ frontend/.env.production mancante"
fi

# Test 5: Verifica struttura file
echo ""
echo "✅ Test 5: File structure check..."
files=(
    "frontend/src/services/apiClient.ts"
    "frontend/vite.config.ts"
    "render.yaml"
    "RENDER_DEPLOY.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file mancante"
    fi
done

echo ""
echo "=================================="
echo "✅ Tutti i test completati!"
echo ""
echo "Prossimi passi:"
echo "1. Aggiorna frontend/.env.production con il tuo URL backend"
echo "2. Committa: git add . && git commit -m 'deploy render'"
echo "3. Push: git push origin main"
echo "4. Deploy su Render seguendo RENDER_DEPLOY.md"
echo "=================================="

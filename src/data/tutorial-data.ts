
export interface TutorialSection {
    id: string;
    title: string;
    icon: string;
    content: string;
}

export const TUTORIAL_DATA: TutorialSection[] = [
    {
        id: 'start',
        title: 'Começando',
        icon: '🚀',
        content: `
            <h3 class="text-lg font-bold text-white mb-2">Bem-vindo ao VN Creator Studio!</h3>
            <p class="mb-4">Esta ferramenta permite criar Visual Novels interativas sem programação. Tudo funciona na base de <strong>Cenas</strong> e <strong>Assets</strong> (arquivos).</p>
            
            <h4 class="font-bold text-cyan-400 mt-4">Fluxo Básico:</h4>
            <ol class="list-decimal pl-5 space-y-2 mt-2">
                <li><strong>Crie um Projeto:</strong> Dê um nome à sua história.</li>
                <li><strong>Importe Assets:</strong> Adicione imagens, músicas e vídeos.</li>
                <li><strong>Crie Cenas:</strong> Monte o visual e o texto.</li>
                <li><strong>Conecte Cenas:</strong> Use botões de escolha para criar caminhos.</li>
                <li><strong>Teste:</strong> Clique em "Testar" para jogar.</li>
            </ol>
        `
    },
    {
        id: 'assets',
        title: 'Imagens e Vídeos',
        icon: '🖼️',
        content: `
            <h3 class="text-lg font-bold text-white mb-2">Como funcionam os Assets?</h3>
            <p class="mb-4">O sistema organiza seus arquivos automaticamente quando você importa:</p>

            <div class="grid gap-3">
                <div class="bg-slate-800 p-3 rounded border border-slate-600">
                    <span class="text-xl">🏙️</span> <strong class="text-white">Fundos (Backgrounds)</strong>
                    <p class="text-xs mt-1 text-slate-400">Imagens opacas (JPG, PNG sem transparência), GIFs animados ou Vídeos (MP4).</p>
                </div>
                <div class="bg-slate-800 p-3 rounded border border-slate-600">
                    <span class="text-xl">👤</span> <strong class="text-white">Personagens</strong>
                    <p class="text-xs mt-1 text-slate-400">Imagens com fundo transparente (PNG). O sistema detecta a transparência automaticamente.</p>
                </div>
                <div class="bg-slate-800 p-3 rounded border border-slate-600">
                    <span class="text-xl">🎵</span> <strong class="text-white">Áudios</strong>
                    <p class="text-xs mt-1 text-slate-400">Músicas de fundo ou efeitos sonoros (MP3, WAV).</p>
                </div>
            </div>
            
            <p class="mt-4 text-xs bg-yellow-900/20 p-2 rounded border border-yellow-700/50">
                <strong>Dica:</strong> Se uma imagem for detectada errado, tente salvar o PNG novamente garantindo que o fundo seja transparente (para personagens) ou opaco (para fundos).
            </p>
        `
    },
    {
        id: 'objects',
        title: 'Objetos Ocultos',
        icon: '🔍',
        content: `
            <h3 class="text-lg font-bold text-white mb-2">Sistema de Investigação</h3>
            <p class="mb-4">Você pode criar jogos de "Point & Click" adicionando Objetos Ocultos nas cenas.</p>

            <ul class="list-disc pl-5 space-y-2">
                <li>Vá na aba <strong>Objetos</strong> no editor.</li>
                <li>Clique em <strong>+ Adicionar</strong>.</li>
                <li>Use o botão <strong>Posicionar (📍)</strong> e clique na tela onde o objeto deve ficar.</li>
                <li>Defina o tamanho da área clicável (Largura/Altura).</li>
                <li><strong>Recompensa:</strong> Você pode fazer o objeto dar um Item (imagem aparece na tela) ou aumentar o Afeto com um personagem.</li>
            </ul>
        `
    },
    {
        id: 'affection',
        title: 'Afeto e Escolhas',
        icon: '❤️',
        content: `
            <h3 class="text-lg font-bold text-white mb-2">Sistema de Relacionamento</h3>
            <p class="mb-2">Você pode ganhar ou perder pontos com personagens baseados nas escolhas do jogador.</p>
            
            <h4 class="font-bold text-pink-400 mt-4">Como usar:</h4>
            <ul class="list-disc pl-5 space-y-2 mt-2">
                <li>Nas <strong>Escolhas</strong> ou nos <strong>Objetos</strong>, procure a caixa "Recompensa de Afeto".</li>
                <li>Selecione o Personagem.</li>
                <li>Defina o valor (ex: +10 para amor, -5 para raiva).</li>
            </ul>
            
            <p class="mt-4">Isso é útil para criar rotas diferentes (ex: Se afeto > 50, vai para o final bom).</p>
        `
    },
    {
        id: 'minigames',
        title: 'Mini-Games',
        icon: '🎮',
        content: `
            <h3 class="text-lg font-bold text-white mb-2">Mini-Games Interativos</h3>
            <p class="mb-4">Adicione desafios entre as cenas para engajar o jogador.</p>
            
            <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="bg-black/30 p-2 rounded"><strong>Quiz:</strong> Perguntas e respostas.</div>
                <div class="bg-black/30 p-2 rounded"><strong>Senha:</strong> Digitar código correto.</div>
                <div class="bg-black/30 p-2 rounded"><strong>Reflexo:</strong> Clicar rápido no alvo.</div>
                <div class="bg-black/30 p-2 rounded"><strong>Memória:</strong> Encontrar pares.</div>
                <div class="bg-black/30 p-2 rounded"><strong>Lockpick:</strong> Acertar o timing das barras.</div>
                <div class="bg-black/30 p-2 rounded"><strong>Ritmo:</strong> Apertar botões na hora certa.</div>
            </div>
        `
    },
    {
        id: 'export',
        title: 'Salvar e Exportar',
        icon: '💾',
        content: `
            <h3 class="text-lg font-bold text-white mb-2">Segurança dos Dados</h3>
            <p class="mb-4">O VN Creator salva tudo no navegador. Se você limpar o cache, perde tudo!</p>
            
            <h4 class="font-bold text-yellow-400">FAÇA BACKUPS!</h4>
            <p class="mb-2">Vá no Menu > <strong>Exportar Projeto (.json)</strong>.</p>
            <p>Isso cria um arquivo único contendo todas as imagens, textos e configurações. Guarde esse arquivo no seu PC ou Nuvem. Para recuperar, basta usar "Importar Projeto".</p>
        `
    }
];

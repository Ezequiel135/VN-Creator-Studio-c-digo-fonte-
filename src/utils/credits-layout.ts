
import { GalleryItem, Scene } from '../types';

export type CreditBlock = 
  | { type: 'text'; content: string }
  | { type: 'image'; data: GalleryItem };

/**
 * Mixes credit text and gallery images.
 * Supports "Manual Mode" via shortcodes:
 * - [cena]: Next available image from gallery list.
 * - [cena: 1]: Specific image from gallery list by Index (1-based).
 * - [cena: SceneName]: Specific scene by Name lookup.
 */
export function generateCreditsLayout(
    fullText: string, 
    gallery: GalleryItem[], 
    playerName: string,
    allScenes: Scene[] = [] 
): CreditBlock[] {
    
    const textProcessed = (fullText || '').replace(/{player}|{user}/gi, playerName);
    // Flexible regex for [cena] or [cena: x], allowing extra spaces
    const hasManualTags = /\[\s*(cena|scene)\s*(?::\s*(.+?))?\s*\]/i.test(textProcessed);

    if (hasManualTags) {
        return generateManualLayout(textProcessed, gallery, allScenes);
    } else {
        return generateAutoLayout(textProcessed, gallery);
    }
}

function generateManualLayout(fullText: string, gallery: GalleryItem[], allScenes: Scene[]): CreditBlock[] {
    const layout: CreditBlock[] = [];
    const galleryQueue = [...gallery]; 
    
    const lines = fullText.split('\n');
    
    // Regex matches the whole tag with tolerance for spaces.
    // matches: [cena], [ cena ], [cena: 1], [ scene : Name ]
    const tagRegex = /^\[\s*(cena|scene)\s*(?::\s*(.+?))?\s*\]$/i;

    let currentTextBlock = '';

    const flushText = () => {
        if (currentTextBlock.trim()) {
            layout.push({ type: 'text', content: currentTextBlock });
        }
        currentTextBlock = '';
    };

    for (const line of lines) {
        // Force trim to fix centering issues if user added spaces/tabs
        const trimmedLine = line.trim();
        const match = trimmedLine.match(tagRegex);

        if (match) {
            // Found a tag on this line
            flushText(); // Flush previous text

            const specificArg = match[2]; // Captures value after :

            if (specificArg) {
                const trimmedArg = specificArg.trim();
                const numberIndex = parseInt(trimmedArg, 10);

                let itemToRender: GalleryItem | null = null;

                // CHECK 1: Is it a Number? (Reference Gallery Index)
                if (!isNaN(numberIndex)) {
                    // User inputs "1" for the 1st item, so we subtract 1 for array index
                    const arrayIndex = numberIndex - 1;
                    if (arrayIndex >= 0 && arrayIndex < gallery.length) {
                        itemToRender = gallery[arrayIndex];
                    }
                } 
                // CHECK 2: Is it a Name? (Reference Scene Name)
                else {
                    const targetName = trimmedArg.toLowerCase();
                    const scene = allScenes.find(s => s.name.toLowerCase() === targetName);
                    if (scene) {
                        itemToRender = { 
                            sceneId: scene.id, 
                            showUiSnapshot: false, 
                            position: 'center' 
                        };
                    }
                }

                if (itemToRender) {
                    layout.push({ type: 'image', data: itemToRender });
                    
                    // Remove used item from queue to prevent duplicate if user mixes specific + generic tags
                    const queueIdx = galleryQueue.findIndex(g => g === itemToRender || (g.sceneId === itemToRender!.sceneId));
                    if (queueIdx > -1) {
                        galleryQueue.splice(queueIdx, 1);
                    }
                }
            } 
            else {
                // Case: [cena] (Generic/Next available)
                const nextItem = galleryQueue.shift();
                if (nextItem) {
                    layout.push({ type: 'image', data: nextItem });
                }
            }
        } else {
            // Normal text line - Use trimmedLine to enforce centering
            currentTextBlock += trimmedLine + '\n';
        }
    }
    
    flushText(); // Final flush

    // Append remaining images that weren't manually placed (optional logic, but safe for credits)
    while(galleryQueue.length > 0) {
        layout.push({ type: 'image', data: galleryQueue.shift()! });
    }

    return layout;
}

function generateAutoLayout(fullText: string, gallery: GalleryItem[]): CreditBlock[] {
    const rawLines = fullText.split('\n');
    const textBlocks: string[] = [];
    let currentBlock = '';

    for (const line of rawLines) {
        const trimmed = line.trim();
        if (!trimmed) {
            if (currentBlock) {
                textBlocks.push(currentBlock);
                currentBlock = '';
            }
        } else {
            if (currentBlock) currentBlock += '\n';
            currentBlock += trimmed;
        }
    }
    if (currentBlock) textBlocks.push(currentBlock);

    const layout: CreditBlock[] = [];
    const totalText = textBlocks.length;
    const totalImages = gallery.length;

    if (totalImages === 0) return textBlocks.map(t => ({ type: 'text', content: t }));
    if (totalText === 0) return gallery.map(g => ({ type: 'image', data: g }));

    const interval = Math.floor(totalText / (totalImages + 1));
    let imageIdx = 0;

    for (let i = 0; i < totalText; i++) {
        layout.push({ type: 'text', content: textBlocks[i] });

        const shouldInsert = (i > 0 && i % Math.max(1, interval) === 0 && imageIdx < totalImages);
        
        if (shouldInsert) {
            layout.push({ type: 'image', data: gallery[imageIdx] });
            imageIdx++;
        }
    }

    while (imageIdx < totalImages) {
        layout.push({ type: 'image', data: gallery[imageIdx] });
        imageIdx++;
    }

    return layout;
}


import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

// 1. STANDARD
@Component({ selector: 'app-terms-standard', standalone: true, imports: [CommonModule], template: `
    <div class="bg-white text-black max-w-lg w-full h-[80%] rounded p-6 flex flex-col shadow-2xl">
        <h2 class="text-2xl font-bold mb-4">{{ title() }}</h2>
        <div class="flex-1 overflow-y-auto whitespace-pre-wrap text-sm mb-4 border p-2 bg-gray-50">{{ text() }}</div>
        <button (click)="close.emit()" class="bg-black text-white py-3 rounded font-bold hover:bg-gray-800">Fechar</button>
    </div>
` }) export class TermsStandardComponent { text=input.required<string>(); title=input.required<string>(); close=output<void>(); }

// 2. PAPER
@Component({ selector: 'app-terms-paper', standalone: true, imports: [CommonModule], template: `
    <div class="bg-[#fdfbf7] text-[#4a4036] max-w-xl w-full h-[85%] shadow-xl p-8 flex flex-col font-serif" style="background-image: url('https://www.transparenttextures.com/patterns/paper.png');">
        <h2 class="text-3xl font-bold mb-6 text-center border-b-2 border-[#4a4036] pb-2">{{ title() }}</h2>
        <div class="flex-1 overflow-y-auto whitespace-pre-wrap text-base leading-relaxed mb-6">{{ text() }}</div>
        <button (click)="close.emit()" class="border-2 border-[#4a4036] text-[#4a4036] py-2 px-8 self-center hover:bg-[#4a4036] hover:text-white transition-colors font-bold">Aceitar</button>
    </div>
` }) export class TermsPaperComponent { text=input.required<string>(); title=input.required<string>(); close=output<void>(); }

// 3. TERMINAL
@Component({ selector: 'app-terms-terminal', standalone: true, imports: [CommonModule], template: `
    <div class="bg-black text-green-500 max-w-2xl w-full h-[70%] border-2 border-green-700 p-4 font-mono shadow-[0_0_20px_rgba(0,255,0,0.2)] flex flex-col">
        <div class="mb-4 border-b border-green-800 pb-2">>> ACCESSING_LEGAL_PROTOCOLS...</div>
        <div class="flex-1 overflow-y-auto whitespace-pre-wrap text-sm mb-4 custom-scrollbar-green">{{ text() }}</div>
        <button (click)="close.emit()" class="bg-green-900/30 text-green-400 py-2 border border-green-600 hover:bg-green-800/50 uppercase text-xs tracking-widest">[ ACKNOWLEDGE ]</button>
    </div>
` }) export class TermsTerminalComponent { text=input.required<string>(); title=input.required<string>(); close=output<void>(); }

// 4. CARD
@Component({ selector: 'app-terms-card', standalone: true, imports: [CommonModule], template: `
    <div class="bg-slate-800 text-white max-w-md w-full rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
        <div class="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mb-4 text-2xl">📝</div>
        <h2 class="text-xl font-bold mb-4">{{ title() }}</h2>
        <div class="flex-1 overflow-y-auto whitespace-pre-wrap text-sm text-slate-300 mb-6 w-full text-left bg-slate-900/50 p-4 rounded-xl">{{ text() }}</div>
        <button (click)="close.emit()" class="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold shadow-lg">Entendido</button>
    </div>
` }) export class TermsCardComponent { text=input.required<string>(); title=input.required<string>(); close=output<void>(); }

// 5. FULLSCREEN
@Component({ selector: 'app-terms-fullscreen', standalone: true, imports: [CommonModule], template: `
    <div class="fixed inset-0 bg-white text-slate-900 overflow-y-auto">
        <div class="max-w-3xl mx-auto p-12 min-h-full flex flex-col">
            <h1 class="text-5xl font-black mb-12">{{ title() }}</h1>
            <div class="flex-1 whitespace-pre-wrap text-lg leading-loose mb-12">{{ text() }}</div>
            <div class="border-t pt-8 flex justify-end">
                <button (click)="close.emit()" class="text-xl font-bold hover:underline">Fechar e Voltar</button>
            </div>
        </div>
    </div>
` }) export class TermsFullscreenComponent { text=input.required<string>(); title=input.required<string>(); close=output<void>(); }

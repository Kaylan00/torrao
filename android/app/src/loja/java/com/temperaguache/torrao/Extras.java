package com.temperaguache.torrao;

import android.app.Activity;
import android.webkit.WebView;

// Versão LOJA: liga as pontes de compra (window.Loja) e de vídeo premiado (window.Anuncio).
final class Extras {
    private Extras() { }

    static void ligar(Activity act, WebView web) {
        web.addJavascriptInterface(new Loja(act, web), "Loja");
        web.addJavascriptInterface(new Anuncio(act, web), "Anuncio");
    }
}

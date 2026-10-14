package com.temperaguache.torrao;

import android.app.Activity;
import android.webkit.WebView;

// Versão LOJA: liga a ponte de compra (window.Loja).
// Vídeo premiado (AdMob) fica pra quando tiver a conta: o código está em tools/futuro/Anuncio.java.txt.
final class Extras {
    private Extras() { }

    static void ligar(Activity act, WebView web) {
        web.addJavascriptInterface(new Loja(act, web), "Loja");
    }
}

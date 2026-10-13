package com.temperaguache.torrao;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.window.OnBackInvokedDispatcher;

import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;

// O app inteiro fica dentro do APK (assets/www) e roda offline numa WebView.
// Os arquivos sao servidos no endereco reservado do Android pra isso, assim o localStorage (o save) funciona normal.
public class MainActivity extends Activity {
    private static final String HOST = "https://appassets.androidplatform.net/";
    private WebView web;
    private TextToSpeech voz;
    private boolean vozPronta = false;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);

        FrameLayout raiz = new FrameLayout(this);
        raiz.setBackgroundColor(0xFF3B2618);
        web = new WebView(this);
        web.setBackgroundColor(0xFF3B2618);
        raiz.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        // Android 15+ desenha por baixo das barras: empurra o app pra dentro delas (e pra cima do teclado)
        raiz.setOnApplyWindowInsetsListener((v, ins) -> {
            int top, bottom, left, right;
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets bar = ins.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                android.graphics.Insets ime = ins.getInsets(WindowInsets.Type.ime());
                top = bar.top; left = bar.left; right = bar.right; bottom = Math.max(bar.bottom, ime.bottom);
            } else {
                top = ins.getSystemWindowInsetTop(); bottom = ins.getSystemWindowInsetBottom();
                left = ins.getSystemWindowInsetLeft(); right = ins.getSystemWindowInsetRight();
            }
            v.setPadding(left, top, right, bottom);
            return ins;
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);                 // save (localStorage)
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setTextZoom(100);                            // tamanho de letra do sistema nao quebra o layout
        web.addJavascriptInterface(new Ponte(), "Nativo");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                String url = req.getUrl().toString();
                if (url.startsWith(HOST)) return false;
                abreFora(url);
                return true;
            }

            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                String url = req.getUrl().toString();
                if (!url.startsWith(HOST)) return null;
                String path = req.getUrl().getPath();
                if (path == null || path.equals("/") || path.isEmpty()) path = "/index.html";
                try {
                    InputStream in = getAssets().open("www" + path);
                    String m = mime(path);
                    return new WebResourceResponse(m, m.startsWith("text") || m.contains("javascript") ? "utf-8" : null, in);
                } catch (IOException e) {
                    WebResourceResponse r = new WebResourceResponse("text/plain", "utf-8", null);
                    r.setStatusCodeAndReasonPhrase(404, "Not Found");
                    return r;
                }
            }
        });
        setContentView(raiz);

        voz = new TextToSpeech(this, st -> {
            if (st == TextToSpeech.SUCCESS) {
                int r = voz.setLanguage(Locale.US);
                vozPronta = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED;
                voz.setSpeechRate(0.9f);
            }
        });

        if (Build.VERSION.SDK_INT >= 33) getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::voltar);
        if (state != null) web.restoreState(state); else web.loadUrl(HOST + "index.html");
    }

    private static String mime(String p) {
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "application/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".json")) return "application/json";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
        if (p.endsWith(".webp")) return "image/webp";
        if (p.endsWith(".woff2")) return "font/woff2";
        if (p.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    private void abreFora(String url) {
        if (url == null || !(url.startsWith("https://") || url.startsWith("http://"))) return;
        try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception e) { /* sem navegador */ }
    }

    // ponte com o app (window.Nativo)
    private class Ponte {
        @JavascriptInterface
        public void falar(String texto) {
            if (!vozPronta || texto == null) return;
            voz.speak(texto, TextToSpeech.QUEUE_FLUSH, null, "fala");
        }

        @JavascriptInterface
        public void copiar(String texto) {
            runOnUiThread(() -> {
                ClipboardManager cb = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
                if (cb != null) cb.setPrimaryClip(ClipData.newPlainText("Torrão", texto));
            });
        }

        @JavascriptInterface
        public void abrir(String url) { runOnUiThread(() -> abreFora(url)); }
    }

    // voltar: primeiro fecha o que estiver aberto no app; na tela inicial, sai
    private void voltar() {
        web.evaluateJavascript("window.CF_voltar ? window.CF_voltar() : false", v -> {
            if (!"true".equals(v)) finish();
        });
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() { voltar(); }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onDestroy() {
        if (voz != null) voz.shutdown();
        super.onDestroy();
    }
}

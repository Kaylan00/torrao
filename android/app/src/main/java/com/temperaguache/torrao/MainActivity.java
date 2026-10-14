package com.temperaguache.torrao;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
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
import java.util.ArrayList;
import java.util.Locale;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONObject;

// O app inteiro fica dentro do APK (assets/www) e roda offline numa WebView.
// Os arquivos sao servidos no endereco reservado do Android pra isso, assim o localStorage (o save) funciona normal.
public class MainActivity extends Activity {
    private static final String HOST = "https://appassets.androidplatform.net/";
    private WebView web;
    private TextToSpeech voz;
    private boolean vozPronta = false;
    private SpeechRecognizer ouvido;
    private boolean querOuvir = false;
    private long ultimoNivel = 0;
    private static final int PEDIDO_MICROFONE = 7;

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
                voz.setSpeechRate(1.0f);
                // avisa o app quando o Torrão termina de falar (na conversa por voz, aí ele começa a ouvir)
                voz.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { js("window.CF_voz && CF_voz('inicio')"); }
                    @Override public void onDone(String id) { js("window.CF_voz && CF_voz('fim')"); }
                    @Override @SuppressWarnings("deprecation") public void onError(String id) { js("window.CF_voz && CF_voz('fim')"); }
                    @Override public void onStop(String id, boolean interrompido) { js("window.CF_voz && CF_voz('parou')"); }
                });
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
            if (!vozPronta || texto == null) { js("window.CF_voz && CF_voz('fim')"); return; }
            voz.speak(texto, TextToSpeech.QUEUE_FLUSH, null, "fala");
        }

        @JavascriptInterface
        public void calar() { if (vozPronta) voz.stop(); }

        // vozes em inglês instaladas (ou que baixam pela internet): nome, local, qualidade, precisa de rede
        @JavascriptInterface
        public String vozes() {
            JSONArray lista = new JSONArray();
            if (!vozPronta) return lista.toString();
            try {
                Set<Voice> todas = voz.getVoices();
                if (todas == null) return lista.toString();
                for (Voice v : todas) {
                    Locale l = v.getLocale();
                    if (l == null || !"en".equals(l.getLanguage())) continue;
                    Set<String> f = v.getFeatures();
                    if (f != null && f.contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) continue;
                    JSONObject o = new JSONObject();
                    o.put("nome", v.getName());
                    o.put("local", l.toLanguageTag());
                    o.put("qualidade", v.getQuality());
                    o.put("rede", v.isNetworkConnectionRequired());
                    lista.put(o);
                }
            } catch (Exception e) { /* motor de voz sem lista */ }
            return lista.toString();
        }

        @JavascriptInterface
        public void usarVoz(String nome) {
            if (!vozPronta || nome == null) return;
            try {
                Voice atual = voz.getVoice();
                if (atual != null && nome.equals(atual.getName())) return;
                for (Voice v : voz.getVoices()) if (nome.equals(v.getName())) { voz.setVoice(v); return; }
            } catch (Exception e) { /* fica a voz padrão */ }
        }

        @JavascriptInterface
        public void velocidade(float v) { if (vozPronta) voz.setSpeechRate(Math.max(0.5f, Math.min(1.5f, v))); }

        @JavascriptInterface
        public boolean temOuvido() { return SpeechRecognizer.isRecognitionAvailable(MainActivity.this); }

        @JavascriptInterface
        public void ouvir() {
            runOnUiThread(() -> {
                if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    querOuvir = true;
                    requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, PEDIDO_MICROFONE);
                } else comecarOuvir();
            });
        }

        @JavascriptInterface
        public void pararOuvir() { runOnUiThread(() -> { if (ouvido != null) ouvido.stopListening(); }); }

        @JavascriptInterface
        public void cancelarOuvir() { runOnUiThread(() -> { if (ouvido != null) ouvido.cancel(); }); }

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

    private void js(String codigo) { runOnUiThread(() -> web.evaluateJavascript(codigo, null)); }

    private void avisaOuvido(String tipo, String texto, String erro) {
        try {
            JSONObject o = new JSONObject();
            o.put("tipo", tipo);
            if (texto != null) o.put("texto", texto);
            if (erro != null) o.put("erro", erro);
            js("window.CF_ouvido && CF_ouvido(" + o + ")");
        } catch (Exception e) { /* segue */ }
    }

    private static String primeiro(Bundle b) {
        if (b == null) return "";
        ArrayList<String> l = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        return l == null || l.isEmpty() || l.get(0) == null ? "" : l.get(0);
    }

    private void comecarOuvir() {
        if (vozPronta) voz.stop();
        if (!SpeechRecognizer.isRecognitionAvailable(this)) { avisaOuvido("erro", null, "sem"); return; }
        if (ouvido == null) {
            ouvido = SpeechRecognizer.createSpeechRecognizer(this);
            ouvido.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle p) { avisaOuvido("ouvindo", null, null); }
                @Override public void onBeginningOfSpeech() { avisaOuvido("falando", null, null); }
                @Override public void onRmsChanged(float db) {
                    long agora = System.currentTimeMillis();
                    if (agora - ultimoNivel < 120) return;
                    ultimoNivel = agora;
                    js("window.CF_ouvido && CF_ouvido({tipo:'nivel',nivel:" + Math.round(db) + "})");
                }
                @Override public void onBufferReceived(byte[] b) { }
                @Override public void onEndOfSpeech() { }
                @Override public void onError(int codigo) {
                    String e = codigo == SpeechRecognizer.ERROR_NO_MATCH || codigo == SpeechRecognizer.ERROR_SPEECH_TIMEOUT ? "silencio"
                        : codigo == SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS ? "permissao"
                        : codigo == SpeechRecognizer.ERROR_NETWORK || codigo == SpeechRecognizer.ERROR_NETWORK_TIMEOUT ? "rede"
                        : codigo == SpeechRecognizer.ERROR_RECOGNIZER_BUSY ? "ocupado" : "erro" + codigo;
                    avisaOuvido("erro", null, e);
                    avisaOuvido("fim", "", null);
                }
                @Override public void onResults(Bundle b) { String s = primeiro(b); avisaOuvido("final", s, null); avisaOuvido("fim", s, null); }
                @Override public void onPartialResults(Bundle b) { String s = primeiro(b); if (!s.isEmpty()) avisaOuvido("parcial", s, null); }
                @Override public void onEvent(int tipo, Bundle p) { }
            });
        }
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US");
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "en-US");
        i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        // quem está aprendendo pensa antes de falar: espera um pouco mais de silêncio antes de encerrar
        i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 2000L);
        i.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 2000L);
        try { ouvido.startListening(i); } catch (Exception e) { avisaOuvido("erro", null, "ocupado"); }
    }

    @Override
    public void onRequestPermissionsResult(int pedido, String[] perms, int[] resultados) {
        super.onRequestPermissionsResult(pedido, perms, resultados);
        if (pedido != PEDIDO_MICROFONE || !querOuvir) return;
        querOuvir = false;
        if (resultados.length > 0 && resultados[0] == PackageManager.PERMISSION_GRANTED) comecarOuvir();
        else { avisaOuvido("erro", null, "permissao"); avisaOuvido("fim", "", null); }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (ouvido != null) ouvido.cancel();
        if (vozPronta) voz.stop();
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
        if (ouvido != null) ouvido.destroy();
        super.onDestroy();
    }
}

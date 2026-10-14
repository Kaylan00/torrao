package com.temperaguache.torrao;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.annotation.NonNull;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.UserMessagingPlatform;

// Vídeo premiado (AdMob), só na versão LOJA. A pessoa escolhe ver um vídeo pra ganhar laranjas; nunca aparece sozinho.
// Antes de carregar anúncio, mostra o pedido de consentimento do Google quando a lei exige (Europa etc.).
// Ponte window.Anuncio: preparar(), pronto(), mostrar(), temPrivacidade(), privacidade().
// Respostas pro app: CF_anuncio('pronto' | 'ganhou' | 'fechou' | 'falhou').
public class Anuncio {
    private final Activity act;
    private final WebView web;
    private final ConsentInformation consentimento;
    private RewardedAd video;
    private boolean iniciado = false, carregando = false, ganhou = false;

    Anuncio(Activity act, WebView web) {
        this.act = act; this.web = web;
        consentimento = UserMessagingPlatform.getConsentInformation(act);
    }

    private void js(String ev) { act.runOnUiThread(() -> web.evaluateJavascript("window.CF_anuncio && CF_anuncio('" + ev + "')", null)); }

    @JavascriptInterface
    public void preparar() {
        act.runOnUiThread(() -> {
            ConsentRequestParameters p = new ConsentRequestParameters.Builder().build();
            consentimento.requestConsentInfoUpdate(act, p,
                    () -> UserMessagingPlatform.loadAndShowConsentFormIfRequired(act, erro -> iniciar()),
                    erro -> iniciar());
            iniciar();   // se já tinha consentimento de antes, não precisa esperar
        });
    }

    private void iniciar() {
        if (!consentimento.canRequestAds()) return;
        if (!iniciado) { iniciado = true; MobileAds.initialize(act, s -> carregar()); }
        else carregar();
    }

    private void carregar() {
        act.runOnUiThread(() -> {
            if (video != null || carregando || BuildConfig.ADMOB_PREMIADO.isEmpty()) return;
            carregando = true;
            RewardedAd.load(act, BuildConfig.ADMOB_PREMIADO, new AdRequest.Builder().build(), new RewardedAdLoadCallback() {
                @Override public void onAdLoaded(@NonNull RewardedAd ad) { video = ad; carregando = false; js("pronto"); }
                @Override public void onAdFailedToLoad(@NonNull LoadAdError e) { video = null; carregando = false; }
            });
        });
    }

    @JavascriptInterface
    public boolean pronto() { return video != null; }

    @JavascriptInterface
    public void mostrar() {
        act.runOnUiThread(() -> {
            if (video == null) { js("falhou"); carregar(); return; }
            ganhou = false;
            video.setFullScreenContentCallback(new FullScreenContentCallback() {
                @Override public void onAdDismissedFullScreenContent() { video = null; js(ganhou ? "ganhou" : "fechou"); carregar(); }
                @Override public void onAdFailedToShowFullScreenContent(@NonNull AdError e) { video = null; js("falhou"); carregar(); }
            });
            video.show(act, r -> ganhou = true);
        });
    }

    // a lei exige um jeito de mudar a escolha de privacidade dos anúncios (botão nos Ajustes)
    @JavascriptInterface
    public boolean temPrivacidade() {
        return consentimento.getPrivacyOptionsRequirementStatus() == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED;
    }

    @JavascriptInterface
    public void privacidade() { act.runOnUiThread(() -> UserMessagingPlatform.showPrivacyOptionsForm(act, e -> { })); }
}

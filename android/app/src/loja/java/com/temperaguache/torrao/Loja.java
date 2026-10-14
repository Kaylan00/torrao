package com.temperaguache.torrao;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Pacotes de laranjas pelo Google Play Billing (só na versão LOJA). Ponte window.Loja:
//   iniciar("laranjas_100,laranjas_300,...")  conecta, manda os preços (já na moeda do país) e entrega compras que ficaram pra trás
//   comprar(id)                               abre a tela de pagamento do Google
//   consumir(token)                           o app já guardou as laranjas: "gasta" a compra pra poder comprar de novo
//   confirmar(token)                          compra única (Torrão Completo): confirma pro Google sem gastar (sem isso, ele devolve o dinheiro em 3 dias)
// Respostas pro app: CF_lojaPrecos(json), CF_lojaCompra({id, token}), CF_lojaFim(ok).
// Os pacotes são CONSUMÍVEIS: o app entrega as laranjas e depois consome. Se fechar no meio, entrega na próxima abertura
// (o app guarda os tokens já entregues, então nunca entrega duas vezes).
public class Loja {
    private final Activity act;
    private final WebView web;
    private BillingClient cli;
    private final Map<String, ProductDetails> det = new HashMap<>();
    private List<String> ids = new ArrayList<>();

    Loja(Activity act, WebView web) { this.act = act; this.web = web; }

    private void js(String code) { act.runOnUiThread(() -> web.evaluateJavascript(code, null)); }

    @JavascriptInterface
    public void iniciar(String csv) {
        ids = new ArrayList<>();
        for (String s : csv.split(",")) if (!s.trim().isEmpty()) ids.add(s.trim());
        act.runOnUiThread(this::conecta);
    }

    private void conecta() {
        if (cli == null) {
            cli = BillingClient.newBuilder(act)
                    .setListener((res, compras) -> {
                        if (res.getResponseCode() == BillingClient.BillingResponseCode.OK && compras != null) {
                            for (Purchase p : compras) entrega(p);
                        } else {
                            js("window.CF_lojaFim && CF_lojaFim(false)");
                        }
                    })
                    .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())
                    .build();
        }
        if (cli.isReady()) { carrega(); return; }
        cli.startConnection(new BillingClientStateListener() {
            @Override public void onBillingSetupFinished(BillingResult r) { if (r.getResponseCode() == BillingClient.BillingResponseCode.OK) carrega(); }
            @Override public void onBillingServiceDisconnected() { /* tenta de novo na próxima compra */ }
        });
    }

    private void carrega() {
        List<QueryProductDetailsParams.Product> lista = new ArrayList<>();
        for (String id : ids) lista.add(QueryProductDetailsParams.Product.newBuilder().setProductId(id).setProductType(BillingClient.ProductType.INAPP).build());
        if (!lista.isEmpty()) {
            cli.queryProductDetailsAsync(QueryProductDetailsParams.newBuilder().setProductList(lista).build(), (r, res) -> {
                JSONObject out = new JSONObject();
                try {
                    for (ProductDetails d : res.getProductDetailsList()) {
                        det.put(d.getProductId(), d);
                        ProductDetails.OneTimePurchaseOfferDetails o = d.getOneTimePurchaseOfferDetails();
                        if (o == null) continue;
                        out.put(d.getProductId(), o.getFormattedPrice());
                    }
                } catch (Exception e) { /* sem preço: o app mostra o padrão */ }
                js("window.CF_lojaPrecos && CF_lojaPrecos(" + out + ")");
            });
        }
        // compras pagas que ainda não foram consumidas (o app fechou no meio, ou Pix/boleto que caiu depois)
        cli.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(), (r, compras) -> {
            for (Purchase p : compras) entrega(p);
        });
    }

    private void entrega(Purchase p) {
        if (p.getPurchaseState() != Purchase.PurchaseState.PURCHASED) return;   // pendente (boleto/Pix): entrega quando pagar
        try {
            for (String id : p.getProducts()) {
                JSONObject o = new JSONObject();
                o.put("id", id);
                o.put("token", p.getPurchaseToken());
                js("window.CF_lojaCompra && CF_lojaCompra(" + o + ")");
            }
        } catch (Exception e) { /* segue */ }
    }

    @JavascriptInterface
    public void comprar(String id) {
        act.runOnUiThread(() -> {
            ProductDetails d = det.get(id);
            if (cli == null || !cli.isReady() || d == null) { js("window.CF_lojaFim && CF_lojaFim(false)"); conecta(); return; }
            List<BillingFlowParams.ProductDetailsParams> l = new ArrayList<>();
            l.add(BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(d).build());
            BillingResult r = cli.launchBillingFlow(act, BillingFlowParams.newBuilder().setProductDetailsParamsList(l).build());
            if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) js("window.CF_lojaFim && CF_lojaFim(false)");
        });
    }

    @JavascriptInterface
    public void confirmar(String token) {
        act.runOnUiThread(() -> {
            if (cli == null || !cli.isReady() || token == null) return;
            cli.acknowledgePurchase(AcknowledgePurchaseParams.newBuilder().setPurchaseToken(token).build(), r -> { });
        });
    }

    @JavascriptInterface
    public void consumir(String token) {
        act.runOnUiThread(() -> {
            if (cli == null || !cli.isReady() || token == null) return;
            cli.consumeAsync(ConsumeParams.newBuilder().setPurchaseToken(token).build(), (r, t) -> { });
        });
    }
}

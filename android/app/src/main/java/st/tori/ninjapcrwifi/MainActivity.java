package st.tori.ninjapcrwifi;

import android.annotation.SuppressLint;
import android.content.Context;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageButton;
import android.widget.TextView;

import java.util.Locale;


public class MainActivity extends AppCompatActivity implements MDNSResolver.MDNSResolverListener {


    private static final String TAG = "NinjaPCR";

    private WebView mWebView;
    private MDNSResolver mResolver;
    private TextView textView;
    private ImageButton reloadButton;
    private static final String REMOTE_CONSOLE_URL = "http://ninjapcr.tori.st/___LANG___/console/index.html";
    private static final String LOCAL_CONSOLE_URL = "file:///android_asset/NinjaPCR_console/___LANG___/console/index.html";
    //    private static final String LOCAL_CONSOLE_URL = "file:///android_asset/NinjaPCR_console/console/img/icon128.png";
    @SuppressLint("JavascriptInterface")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_main);

        mWebView = (WebView)findViewById(R.id.webView);
        textView = (TextView)findViewById(R.id.textView);
        textView.setText("Loading...");


        WebViewClient client = new WebViewClient() {

            @Override
            public void onPageFinished(WebView view, String url) {
                Log.d("NinjaPCR", "WebViewClient.onPageFinished");
                if (url.startsWith("http")) {

                    textView.setText("Remote console");
                } else {

                    textView.setText("Local console");
                }
            }

            @Override
            public void onReceivedError(WebView view, int errorCode,
                                        String description, String failingUrl) {
                Log.d("NinjaPCR", "WebViewClient.onReceivedError " + failingUrl);
                // TODO URL matching
                loadLocalUI();
            }
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                Log.d("NinjaPCR", "WebViewClient.onReceivedError 2");
            }
        };
        mWebView.setWebViewClient(client);
        //loadLocalUI();
        loadRemoteUI();
        mWebView.addJavascriptInterface(new WebAppInterface(this), "Android");
        mWebView.getSettings().setDomStorageEnabled(true);
        mWebView.getSettings().setJavaScriptEnabled(true);

        mResolver = new MDNSResolver(this);
        mResolver.setListener(this);

        reloadButton = (ImageButton)findViewById(R.id.reloadButton);
        reloadButton.setOnClickListener((View v)->{
            loadLocalUI();
        });
    }

    private void loadRemoteUI() {
        mWebView.loadUrl(REMOTE_CONSOLE_URL.replace("___LANG___", getLang()));
    }
    private void loadLocalUI() {
        mWebView.loadUrl(LOCAL_CONSOLE_URL.replace("___LANG___", getLang()));
    }
    private String getLang () {
        return (getResources().getConfiguration().locale.getLanguage().equals("ja")) ? "ja" : "en";
    }

    public class WebAppInterface {
        Context mContext;

        WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void resolveHost(String host) {
            mResolver.resolve(host);
        }
    }

    /* MDNSResolver.MDNSResolverListener */

    @Override
    public void onHostResolved(String hostName, String hostIP) {

        String url = "javascript:onHostResolved('" + hostIP + "')";
        mWebView.loadUrl(url);
    }

    @Override
    public void onResolveFailed() {
        mWebView.loadUrl("javascript:onResolveFailed()");

    }

}

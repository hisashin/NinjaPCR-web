package st.tori.ninjapcrwifi;

import android.app.Activity;
import android.content.Context;
import android.net.nsd.NsdManager;
import android.net.nsd.NsdServiceInfo;
import android.os.Handler;
import android.util.Log;

/**
 * Created by maripo on 2018/06/13.
 */

public class MDNSResolver implements NsdManager.DiscoveryListener, NsdManager.ResolveListener {
    private static final String TAG = "NinjaPCR";
    private static final String SERVICE_TYPE = "_http._tcp.";
    private final Activity activity;
    private static final int TIMEOUT_MSEC = 5000;
    private boolean discoveryStarted = false;
    private NsdServiceInfo foundServiceInfo = null;

    public void setListener(MDNSResolverListener listener) {
        this.listener = listener;
    }

    private MDNSResolverListener listener = null;

    public interface MDNSResolverListener {
        public void onHostResolved (String hostName, String hostIP);
        public void onResolveFailed();
    }

    private NsdManager mNsdManager;
    private String hostName;

    public MDNSResolver(MainActivity activity) {
        this.activity = activity;
        mNsdManager = (NsdManager) activity.getSystemService(Context.NSD_SERVICE);
    }

    protected void resolve(String hostName) {
        mNsdManager.discoverServices(SERVICE_TYPE, NsdManager.PROTOCOL_DNS_SD, this);
        this.hostName = hostName;
        foundServiceInfo = null;
        new Handler().postDelayed(()->{
            Log.d(TAG, "Check timeout.");
            if (discoveryStarted) {
                activity.runOnUiThread(()->{
                    mNsdManager.stopServiceDiscovery(MDNSResolver.this);
                    callOnFail();
                });

            }
        }, TIMEOUT_MSEC);
    }

    @Override
    public void onStartDiscoveryFailed(String serviceType, int errorCode) {
        callOnFail();
    }

    @Override
    public void onStopDiscoveryFailed(String serviceType, int errorCode) {
        callOnFail();

    }

    @Override
    public void onDiscoveryStarted(String serviceType) {
        discoveryStarted = true;
        Log.d(TAG, "onDiscoveryStarted");
    }
    @Override
    public void onDiscoveryStopped(String serviceType) {
        Log.d(TAG, "onDiscoveryStopped");
        if (foundServiceInfo!=null) {
            mNsdManager.resolveService(foundServiceInfo, this);
        }
    }

    @Override
    public void onServiceFound(NsdServiceInfo serviceInfo) {
        Log.d(TAG, "onServiceFound " + serviceInfo.getServiceName() + ", " + serviceInfo.getHost());
        if (hostName.equals(serviceInfo.getServiceName())) {
            this.foundServiceInfo = serviceInfo;
            mNsdManager.stopServiceDiscovery(this);
            discoveryStarted = false;
        }
    }

    @Override
    public void onServiceLost(NsdServiceInfo serviceInfo) {
        Log.d(TAG, "onServiceLost");
        callOnFail();

    }

    @Override
    public void onResolveFailed(NsdServiceInfo serviceInfo, int errorCode) {
        Log.d(TAG, "onResolveFailed");
        callOnFail();
    }

    private void callOnFail() {
        activity.runOnUiThread(()->{
            listener.onResolveFailed();
        });
    }

    @Override
    public void onServiceResolved(final NsdServiceInfo serviceInfo) {
        Log.d(TAG, "onServiceResolved " + serviceInfo);
        activity.runOnUiThread(()->{
                listener.onHostResolved(serviceInfo.getServiceName(),
                        serviceInfo.getHost().toString().replace("/",""));
            });
    }
}

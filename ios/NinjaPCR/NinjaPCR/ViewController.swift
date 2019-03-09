//
//  ViewController.swift
//  NinjaPCR
//
//  Created by Mariko GODA on 2019/03/07.
//  Copyright © 2019 Toriningen Inc. All rights reserved.
//

import UIKit
import WebKit

var language:String = "en"

class ViewController: UIViewController, WKNavigationDelegate {
    
    @IBOutlet var webView: WKWebView!
    @IBOutlet var indicator: UIActivityIndicatorView!
    @IBOutlet var statusLabel: UILabel!
    @IBOutlet var reloadButton: UIButton!
    
    @IBAction func reload () {
        loadConsole()
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        webView.navigationDelegate = self
        language = getLanguage()
        print("language", language)
        loadConsole()
    }
    
    private func loadConsole () {
        reloadButton.isEnabled = false
        indicator.startAnimating()
        indicator.isHidden = false
        webView.load(URLRequest(url: getRemoteConsoleURL()))
    }
    
    private func getRemoteConsoleURL () -> URL {
        let urlStr = String(format: "http://ninjapcr.tori.st/%@/console/index.html", language)
        return URL(string: urlStr)!
    }
    private func getLocalFileURL () -> URL {
        let urlStr = String(format: "%@/NinjaPCR_console/%@/console/index.html",
                            Bundle.main.bundlePath, language)
        return URL(fileURLWithPath: urlStr)
    }
    private func getLanguage () -> String {
        if NSLocale.current.languageCode == "ja" {
            return "ja"
        } else {
            return "en"
        }
    }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print(error)
        loadLocalConsole()
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        print(error)
        loadLocalConsole()
    }
    func loadLocalConsole () {
        webView.load(URLRequest(url: getLocalFileURL()))
    }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        indicator.stopAnimating()
        indicator.isHidden = true
        reloadButton.isEnabled = true
        print("didFinish", webView.url)
        if getConsoleType() == .remote {
            print("Using remote console")
            statusLabel.text = "Remote console"
        } else {
            print("Using local console")
            statusLabel.text = "Local console"
        }
    }
    func getConsoleType () -> ConsoleType {
        print("getConsoleType",webView.url!.absoluteString)
        let absURL = webView.url!.absoluteString
        if absURL.starts(with: "http") {
            return .remote
        } else {
            return .local
        }
    }
    enum ConsoleType {
        case local
        case remote
    }
}


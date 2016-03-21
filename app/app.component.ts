import { Component } from 'angular2/core';
import { Http } from 'angular2/http';
import { WindowService } from './window.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.html',
    providers: [WindowService]
})
export class AppComponent {

    constructor(private _http: Http, private _windowService: WindowService) { }
    private _url = 'https://accounts.google.com/o/oauth2/v2/auth?' +
                    'redirect_uri=http://localhost:3000/google/auth&' +
                    'response_type=token&client_id=694571256431-5pgcu695fifdrlgmp7qmhs9fnuo0ns3f.apps.googleusercontent.com&' +
                    'scope=email%20profile';

    private _authenticated = false;
    private _timer: number;

    public login() {
        let windowHandle = this._windowService.createWindow(this._url, "Google authorization");
        this._timer = setInterval(() => this._checkChild(windowHandle), 100);
    }

    private _checkChild(windowHandle: Window): void {
        try {
            let address = windowHandle.document.URL;

            if (address.startsWith("http://localhost:3000/google/auth")) {

                if (this._accessDenied(address)) {
                    console.log("error will be handled here");
                }
                else {
                    let accessTokenIndex = address.indexOf("access_token");
                    let tokenTypeIndex = address.indexOf("token_type");
                    let expiresInIndex = address.indexOf("expires_in");

                    let accessToken = address.substring(accessTokenIndex, tokenTypeIndex - 1);
                    let tokenType = address.substring(tokenTypeIndex, expiresInIndex - 1);
                    let expiresIn = address.substring(expiresInIndex);

                    console.log(accessToken);
                    console.log(tokenType);
                    console.log(expiresIn);

                    Cookie.setCookie("loginData", "access_token: " + accessToken + ", token_type: " + tokenType + ", expires_in: " + expiresIn);
                }

                clearInterval(this._timer);
                windowHandle.close();
            }
        }
        catch (exception) {
            // ignore, waiting for user to come back to localhost
        }
    }

    private _accessDenied(address: string) : boolean {
        return address == "http://localhost:3000/google/auth#error=access_denied";
    }
}

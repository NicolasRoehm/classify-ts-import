# Angular VSCode Cleaner

## Usage

[Installing Extensions](https://vscode-docs.readthedocs.io/en/stable/extensions/install-extension/)

Get the project locally using
```sh
git clone https://github.com/NicolasRoehm/angular-vscode-cleaner.git
```

Download dependencies using
```sh
npm i
```

Compile the extension with
```sh
npm run compile
```

Move the extension to the following folder

- Windows `%USERPROFILE%\.vscode\extensions`
- Mac `$HOME/.vscode/extensions`
- Linux `$HOME/.vscode/extensions`

## Development

Start tsc watch `npm run watch` then press `F5`.

### Unclassified import example

```ts
import {Inject, Injectable} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {AuthUserDto} from '@repository/auth-user.type';
import {ExpiredSession} from '@core/store/actions/auth.actions';
import {Store} from '@ngrx/store';
import {IAppState} from '@core/store/state/app.state';
import {HttpClient} from "@angular/common/http";
import {Actions} from "@ngrx/effects";
import {User} from "@models/user";
import {userKey} from "@core/models/store-key";
import {SetUser} from "@core/store/actions/user.actions";
import {TokenService} from "@core/services/token.service";
import {IStore, RC_STORE} from "@core/services/store/interface";
import {defaultRouting} from "../../routes/default-routing";
import {RoleType} from "../models/role-type";
import {sourceRouting} from "../../routes/sourcer-routing";
import {dispatchRouting} from "../../routes/dispatcher-routing";
import {pilotRouting} from "../../routes/pilot-routing";
import {Router} from "@angular/router";
```
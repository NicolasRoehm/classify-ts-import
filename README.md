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
import { Component, EventEmitter, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import * as _ from "lodash";
import { AuthService } from '../../shared/services/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { Profile } from '../../shared/models/profile.model';
import { AddProfileComponent }    from '../add-profile/add-profile.component';
import { RemoveProfileComponent } from '../remove-profile/remove-profile.component';
import { User } from '../../shared/models/user.model';
```

## Credits

[tjx666/vscode-extension-boilerplate](https://github.com/tjx666/vscode-extension-boilerplate)
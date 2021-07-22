import { Component, OnInit } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Menu } from 'src/app/_model/menu';
import { LoginService } from 'src/app/_service/login.service';
import { MenuService } from 'src/app/_service/menu.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  menus: Menu[];
  usuario: string;

  constructor(
    private menuService: MenuService,
    public loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.menuService.getMenuCambio().subscribe(data => {
      this.menus = data;
    });

    const helper = new JwtHelperService();
    let token = sessionStorage.getItem(environment.TOKEN_NAME);

    const decodedToken = helper.decodeToken(token);

    this.usuario = decodedToken.user_name;

    this.menuService.listarPorUsuario(this.usuario).subscribe(data => {
      this.menuService.setMenuCambio(data);
    });
  }
}

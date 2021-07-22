import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Signos } from 'src/app/_model/signos';
import { SignosService } from 'src/app/_service/signos.service';
import { ModalConfirmarComponent } from '../generics/modal-confirmar/modal-confirmar.component';

@Component({
  selector: 'app-signos',
  templateUrl: './signos.component.html',
  styleUrls: ['./signos.component.css']
})
export class SignosComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: MatTableDataSource<Signos>;
  displayedColumns: string[] = ['paciente', 'temperatura', 'pulso', 'ritmo', 'acciones'];
  cantidad: number = 0;
  constructor(
    private signosService: SignosService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    public route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.listarSignos();

    this.signosService.getSignoCambio().subscribe(data => {
      this.crearTabla(data);
    });

    this.signosService.getMensajeCambio().subscribe(data => {
      this.snackBar.open(data, 'AVISO', {
        duration: 2000,
        verticalPosition: "top",
        horizontalPosition: "right"
      });
    });
  }

  private listarSignos() {
    this.signosService.listarPageable(0, 10).subscribe(data => {
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
      this.dataSource.sort = this.sort;
    });
  }

  crearTabla(data: Signos[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  filtrar(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  mostrarMas(e: any){
    this.signosService.listarPageable(e.pageIndex, e.pageSize).subscribe(data => {
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
      this.dataSource.sort = this.sort;
    });
  }

  eliminar(id: number){
    let dialogRef = this.dialog.open(ModalConfirmarComponent,{
      disableClose: true,
      height : "200px",
      width: "300px",
    });
    dialogRef.afterClosed().subscribe(res =>{
      if(res){
        this.signosService.eliminar(id).pipe(switchMap(()=>{
          return this.signosService.listar();
        }))
        .subscribe(data =>{
          this.signosService.setSignoCambio(data);
          this.signosService.setMensajeCambio('SE ELIMINO');

        })
      }
    })
  }

}

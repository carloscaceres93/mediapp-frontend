import { Component, OnInit, ViewChild } from '@angular/core';
import { PacienteService } from 'src/app/_service/paciente.service';
import { Paciente } from 'src/app/_model/paciente';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ModalConfirmarComponent } from '../generics/modal-confirmar/modal-confirmar.component';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-paciente',
  templateUrl: './paciente.component.html',
  styleUrls: ['./paciente.component.css']
})
export class PacienteComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: MatTableDataSource<Paciente>;
  displayedColumns: string[] = ['idPaciente', 'nombres', 'apellidos', 'acciones'];
  cantidad: number = 0;

  constructor(
    private pacienteService: PacienteService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    public route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    /*this.pacienteService.listar().subscribe(data => {
      this.crearTabla(data);
    });*/

    this.pacienteService.listarPageable(0, 10).subscribe(data => {
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
      this.dataSource.sort = this.sort;
    });

    this.pacienteService.getPacienteCambio().subscribe(data => {
      this.crearTabla(data);
    });

    this.pacienteService.getMensajeCambio().subscribe(data => {
      this.snackBar.open(data, 'AVISO', {
        duration: 2000,
        verticalPosition: "top",
        horizontalPosition: "right"
      });
    });
  }

  crearTabla(data: Paciente[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  filtrar(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  mostrarMas(e: any){
    this.pacienteService.listarPageable(e.pageIndex, e.pageSize).subscribe(data => {
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
        this.pacienteService.eliminar(id).pipe(switchMap(()=>{
          return this.pacienteService.listar();
        }))
        .subscribe(data =>{
          this.pacienteService.setPacientecambio(data);
          this.pacienteService.setMensajeCambio('SE ELIMINO');

        })
      }
    })
  }
}

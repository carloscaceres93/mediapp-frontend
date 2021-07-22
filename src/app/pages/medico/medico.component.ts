import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { switchMap } from 'rxjs/operators';
import { Medico } from 'src/app/_model/medico';
import { MedicoService } from 'src/app/_service/medico.service';
import { ModalConfirmarComponent } from '../generics/modal-confirmar/modal-confirmar.component';
import { MedicoDialogoComponent } from './medico-dialogo/medico-dialogo.component';

@Component({
  selector: 'app-medico',
  templateUrl: './medico.component.html',
  styleUrls: ['./medico.component.css'],
})
export class MedicoComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: MatTableDataSource<Medico>;
  displayedColumns: string[] = ['idMedico', 'nombres', 'apellidos', 'acciones'];

  constructor(
    private medicoService: MedicoService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
    ) {}

  ngOnInit(): void {
    this.listarMedico();
    this.getPacienteCambio();
    this.getMensajeCambio();
  }

  private crearTabla(data: Medico[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  filtrar(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  private listarMedico() {
    this.medicoService.listar().subscribe((data) => {
      this.crearTabla(data);
    });
  }

  openDialog(id?: number) {
    this.dialog.open(MedicoDialogoComponent, {
      disableClose: true,
      height: '300px',
      width: '480px',
      data: {
        id: id
      },
    }),
    console.log(id);

  }

  private getPacienteCambio() {
    this.medicoService.getMedicoCambio().subscribe((data) => {
      this.crearTabla(data);
    });
  }

  private getMensajeCambio() {
    this.medicoService.getMensajeCambio().subscribe((data) => {
      this.snackBar.open(data, 'AVISO', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
      });
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
        this.medicoService.eliminar(id).pipe(switchMap(()=>{
          return this.medicoService.listar();
        }))
        .subscribe(data =>{
          this.medicoService.setMedicoCambio(data);
          this.medicoService.setMensajeCambio("SE ELIMINO");
        })
      }
    })
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';


import { Medico } from 'src/app/_model/medico';
import { MedicoService } from 'src/app/_service/medico.service';

@Component({
  selector: 'app-medico-dialogo',
  templateUrl: './medico-dialogo.component.html',
  styleUrls: ['./medico-dialogo.component.css'],
})
export class MedicoDialogoComponent implements OnInit {

  medico: Medico;
  formMedico : FormGroup;

  constructor(
    private medicoService: MedicoService,
    private dialogRef: MatDialogRef<MedicoDialogoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {id: number}
    ) {}

  ngOnInit(): void {
    //this.medico = { ...this.data }; pasar la data a un objeto
    this.initFormMedico();
    this.cargarDatosEdicion();
  }

  initFormMedico(){
    this.formMedico = new FormGroup({
      idMedico: new FormControl(0, Validators.required),
      nombres: new FormControl('', Validators.required),
      apellidos: new FormControl('', Validators.required),
      cmp: new FormControl('', Validators.required),
      fotoUrl: new FormControl('',Validators.required)
    });
  }

  operar() {
    let medico: Medico = new Medico();
    medico.nombres = this.formMedico.value['nombres'],
    medico.apellidos = this.formMedico.value['apellidos'];
    medico.cmp = this.formMedico.value['cmp'];
    medico.fotoUrl = this.formMedico.value['fotoUrl'];

    if(this.data.id != 0){

      medico.idMedico = this.data.id;
      this.medicoService.modificar(medico).pipe(switchMap(()=>{
        return this.medicoService.listar();
      })).subscribe(res =>{
        this.medicoService.setMedicoCambio(res);
        this.medicoService.setMensajeCambio("SE MODIFICO");
        this.dialogRef.close(true);
      });

    }else{
      this.medicoService.registrar(medico).pipe(switchMap(()=>{
        return this.medicoService.listar();
      })).subscribe(data =>{
        this.medicoService.setMedicoCambio(data);
        this.dialogRef.close(true);
        this.medicoService.setMensajeCambio("SE MODIFICO");
      });
    }
  }

  cargarDatosEdicion(){
    if(this.data.id != 0){
      this.medicoService.listarPorId(this.data.id).subscribe(res =>{

          this.formMedico.setValue({
            idMedico: res.idMedico,
            nombres: res.nombres,
            apellidos: res.apellidos,
            cmp: res.cmp,
            fotoUrl: res.fotoUrl
          });
      });
    }
  }
}

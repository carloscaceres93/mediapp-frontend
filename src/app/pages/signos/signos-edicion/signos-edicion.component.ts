import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Paciente } from 'src/app/_model/paciente';
import { Signos } from 'src/app/_model/signos';
import { PacienteService } from 'src/app/_service/paciente.service';
import { SignosService } from 'src/app/_service/signos.service';

@Component({
  selector: 'app-signos-edicion',
  templateUrl: './signos-edicion.component.html',
  styleUrls: ['./signos-edicion.component.css']
})
export class SignosEdicionComponent implements OnInit {

  formSigno: FormGroup;
  pacientes: Paciente[] = [];

  myControlPaciente: FormControl = new FormControl('', Validators.required);
  pacientesFiltrados$: Observable<Paciente[]>;

  id:number = 0;
  validar: boolean;

  constructor(
    private signoService: SignosService,
    private pacienteService: PacienteService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initFormSigno();
    this.cargarDatosEdicion();
    this.listarPacientes();
    this.pacientesFiltrados$ = this.myControlPaciente.valueChanges.pipe(map(val => this.filtrarPacientes(val)));
  }

  initFormSigno() {
    this.formSigno = new FormGroup({
      idSigno: new FormControl(0),
      paciente: this.myControlPaciente,
      temperatura: new FormControl('', Validators.required),
      pulso: new FormControl('', Validators.required),
      ritmo: new FormControl('', Validators.required)
    });
  }

  listarPacientes() {
    this.pacienteService.listar().subscribe(data => {
      this.pacientes = data;
    });
  }

  filtrarPacientes(val: any) {
    if (val != null && val.idPaciente > 0) {
      return this.pacientes.filter(el =>
        el.nombres.toLowerCase().includes(val.nombres.toLowerCase()) || el.apellidos.toLowerCase().includes(val.apellidos.toLowerCase()) || el.dni.includes(val.dni)
      );
    }
    return this.pacientes.filter(el =>
      el.nombres.toLowerCase().includes(val?.toLowerCase()) || el.apellidos.toLowerCase().includes(val?.toLowerCase()) || el.dni.includes(val)
    );
  }

  mostrarPaciente(val: Paciente) {
    return val ? `${val.nombres} ${val.apellidos}` : val;
  }

  registrar() {
    let signo = new Signos();
    signo.paciente = this.formSigno.value['paciente'];
    signo.pulso = this.formSigno.value['pulso'];
    signo.ritmo = this.formSigno.value['ritmo'];
    signo.temperatura = this.formSigno.value['temperatura'];

    if(this.validar){
      signo.idSigno = this.id;
      this.signoService.modificar(signo).pipe(switchMap(()=>{
        return this.signoService.listar();
      })).subscribe(res =>{
        this.signoService.setSignoCambio(res);
        this.signoService.setMensajeCambio("SE MODIFICO");
      });
    }else{
      this.signoService.registrar(signo).pipe(switchMap(()=>{
        return this.signoService.listar();
      })).subscribe(res =>{
        this.signoService.setSignoCambio(res);
        this.signoService.setMensajeCambio("SE REGISTRO");
      });
    }
    this.router.navigate(['/pages/signo']);
  }

  cargarDatosEdicion() {
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.validar = params['id'] != null;
      if (this.validar) {
        this.signoService.listarPorId(this.id).subscribe(signo => {
          this.formSigno.setValue({
            idSigno: signo.idSigno,
            paciente: signo.paciente,
            temperatura: signo.temperatura,
            pulso: signo.pulso,
            ritmo: signo.ritmo
          });
        });
      }
    })
  }

}

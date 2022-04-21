//AUDIOS
const audioEsbirrosPegandose = new Audio("ataqueEsbirros.mp3");
const audioEsbirrosMuerto = new Audio("muerteEsbirros.mp3");
const audioTurno = new Audio("campanaTurno.mp3");
const audioSoltarCarta = new Audio("soltarCarta.mp3");
const audioMuerte = new Audio("muerte.mp3");
const audioVictoria = new Audio("victoriaPartida.mp3");

//Turno de partida
let turno = 1;
//Mana local y visitante
let manaLocal = 0;
let manaVisitante = 0;
let manaAux = 0;
//Maná de la carta
let manaEsbirro = '';

//A quien le toca jugar: local o visitante
let tocaJugar = 'LOCAL';

$(function () {
    start();
});

//EJEMPLO: 2 ESBIRROS VISITANTES VS 3 ESBIRROS LOCALES (1 DORMIDA)
//EJEMPLO: EMPIEZA SIEMPRE LOCAL

function start() {
    verEsbirro();
    atacarEsbirro();
    pasarTurno();
    quieroVerTablero();
    $('#marcadorTurno').text(turno);
    $('#marcadorManaLocal').text(manaLocal);
    $('#marcadorManaVisitante').text(manaVisitante);
    //CARTAS EN MAZO ESTAN HIDDEN
    $('#mazoLocal').children().hide();
    soltarCarta();
}

//CUANDO PASAMOS EL RATON POR ENCIMA NOS MOSTRARÁ FUNCIONES DE NUESTRO ESBIRRO 
//(BORDE VERDE: ESPERANDO ORDEN, BORDE GRIS: DORMIDO, BORDE AMARILLO: YA ATACÓ)
function verEsbirro() {

    $(document).on('mouseover', '.carta', function () {

    //     $('.carta').attr('draggable', 'true');
    // $('.visitante').attr('draggable', 'false');
    // $('.zzz').attr('draggable', 'false');
    // $('.enMano').attr('draggable', 'false');

        //Comprobar si la esbirro es local
        if ($(this).hasClass('local')) {
            $(this).css('border', '');
            $(this).addClass('seleccionada');
        }
        //Comprobar si la esbirro esta dormida
        if ($(this).hasClass('zzz')) {
            $(this).css('border', '10px solid gray');
            $(this).attr('draggable', 'false');
        }
        //Comprobar si la esbirro es visitante
        if ($(this).hasClass('visitante')) {
            $(this).css('border', '10px solid black');
        }
        //Comprobar si la esbirro es visitante
        if ($(this).hasClass('enMano')) {
            $(this).attr('draggable', 'false');
        }
    });

    $(document).on('mouseout', '.carta', function () {
        $(this).css('border', '1px solid black');

        if ($(this).hasClass('seleccionada')) {
            $(this).removeClass('seleccionada');
        }
        if ($(this).hasClass('soltable')) {
            $(this).removeClass('soltable');
            $(this).addClass('enMano');
        }

        //Si recibió orden se queda con su borde (tieneOrden)
        //Si la carta recibió la orden ya no puede cogerse
        if ($(this).hasClass('tieneOrden')) {
            $(this).css('border', '');
            $('.tieneOrden').attr('draggable', 'false');
        }
        //Si está en mano se queda con su borde (enMano)
        if ($(this).hasClass('enMano')) {
            $(this).removeClass('col-2');
            $(this).addClass('col-1');
            $(this).css('border', '1px solid #bbbbbb');
        }
    });

}

//EL TABLERO ES DEMASIADO GRANDE Y LAS CARTAS DE TU MANO ESTORBAN LA VISIÓN
function quieroVerTablero() {
    $(document).on('mouseover', '#tableroCompleto', function () {
        $('#cartasEnManoLocal').hide();
    });
    $(document).on('mouseout', '#tableroCompleto', function () {
        $('#cartasEnManoLocal').show();
    });

}

//MOVEMOS A NUESTRO ESBIRRO SOBRE OTRO ESBIRRO VISITANTE O SOBRE LA CABEZA VISITANTE
function atacarEsbirro() {

    let esbirroLocal = '';
    let esbirroVisitante = '';

    let vidaCabezaVisitante = '';

    let ataqueLocal = '';
    let ataqueVisitante = '';

    let defensaLocal = '';
    let defensaVisitante = '';

    //Si la carta recibió la orden ya no puede cogerse (mouseout)
    $('.carta').attr('draggable', 'true');
    $('.visitante').attr('draggable', 'false');
    $('.zzz').attr('draggable', 'false');
    $('.enMano').attr('draggable', 'false');


    //Nuestro esbirro se encuentra sobre el ESBIRRO enemigo, (si este método se borra, drop no funciona)
    $(document).on('dragover', '.visitante', e => {
        e.preventDefault();
    });
    //Nuestro esbirro se encuentra sobre la CABEZA enemiga, (si este método se borra, drop no funciona)
    $(document).on('dragover', '#cabezaVisitante', e => {
        e.preventDefault();
    });

    //Nuestro esbirro lo acabamos de coger
    $(document).on('dragstart', '.local', e => {
        esbirroLocal = e.target;
    });

    //Nuestro esbirro se encuentra sobre el ESBIRRO enemigo y es soltado
    $(document).on('drop', '.visitante', e => {
        esbirroVisitante = e.target;

        //Esbirro local vs esbirro visitante
        if (esbirroLocal != '' && esbirroVisitante != '') {

            ataqueLocal = $(esbirroLocal).children().first().text();
            defensaLocal = $(esbirroLocal).children().last().text();

            ataqueVisitante = $(esbirroVisitante).children().first().text();
            defensaVisitante = $(esbirroVisitante).children().last().text();

            defensaLocal = defensaLocal - ataqueVisitante;
            defensaVisitante = defensaVisitante - ataqueLocal;

            $(esbirroLocal).addClass('tieneOrden');

            //Modificamos los valores (defensa) a cada esbirro respectivamente
            //Si la defensa es <=0 el esbirro morirá
            if (defensaLocal <= 0) {
                //MUERE ESBIRRO LOCAL
                $(esbirroLocal).addClass('cartaMuerta');
                setTimeout(function eliminarEsbirro() { $(esbirroLocal).remove(); }, 400);
            } else {
                // SOBREVIVE ESBIRRO LOCAL
                $(esbirroLocal).addClass('cartaModificadaDefensa');
                $(esbirroLocal).children().next().text(defensaLocal);
            }
            if (defensaVisitante <= 0) {
                //MUERE ESBIRRO VISITANTE
                $(esbirroVisitante).removeClass('cartaModificadaDefensa');
                $(esbirroVisitante).addClass('cartaMuerta');
                setTimeout(function eliminarEsbirro() { $(esbirroVisitante).remove(); }, 400);
                audioEsbirrosMuerto.play();
            } else {
                //SOBREVIVE ESBIRRO VISITANTE
                $(esbirroVisitante).addClass('cartaModificadaDefensa');
                $(esbirroVisitante).children().next().text(defensaVisitante);
                audioEsbirrosPegandose.play();
            }

        }//Esbirro local vs esbirro visitante
    });

    //Nuestro esbirro se encuentra sobre la CABEZA enemiga y es soltado
    $(document).on('drop', '#cabezaVisitante', e => {
        vidaCabezaVisitante = $('#vidaVisitante').text();

        if (esbirroLocal != '') {
            ataqueLocal = $(esbirroLocal).children().first().text();
            vidaCabezaVisitante = vidaCabezaVisitante - ataqueLocal;

            $(esbirroLocal).addClass('tieneOrden');
            $('#vidaVisitante').text(vidaCabezaVisitante);
            $('#cabezaVisitante').addClass('cartaModificadaDefensa');
            audioEsbirrosMuerto.play();
            setTimeout(function delayPegarCabeza() { $('#cabezaVisitante').removeClass('cartaModificadaDefensa'); }, 400);

            //SI LA CABEZA VISITANTE A MUERTO
            if ($('#vidaVisitante').text() <= 0) {
                $('#cabezaVisitante').removeClass('cartaModificadaDefensa');
                $('#cabezaVisitante').addClass('cabezaMuerta');
                audioMuerte.play();

                setTimeout(function delayAudioVictoria() { audioVictoria.play(); }, 3000);
                $('#modal').show();
                $('#tituloModal').text("¡ Enhorabuena has ganado la partida !");
                $('#pModal').text(" ");
                $('#pModal').append("<a href="+window.location.href+" type='button' class='btn btn-warning'>Volver a jugar</a>");
            }
        }
    });
}

//CLICKAMOS EN PASAR TURNO
function pasarTurno() {

    //EJEMPLO: EMPIEZA SIEMPRE LOCAL
    $('#tocaJugar').text(tocaJugar);
    $('#tocaJugar').css('color', '#7575fb');

    $(document).on('click', '#pasarTurno', function () {
        audioTurno.play();
        turno++;
        $('#marcadorTurno').text(turno);
        if (turno % 2 == 0) {
            tocaJugar = 'VISITANTE';
            //LOS ESBIRROS ALIADOS NO PUEDEN ATACAR EN TURNO VISITANTE
            $('.local').attr('draggable', 'false');

            $('#tocaJugar').text(tocaJugar);
            $('#tocaJugar').css('color', '#ff5e5e');
            if (manaLocal < 10) {
                manaLocal++;
                manaAux = manaLocal;
            }
            $('#marcadorManaLocal').text(manaLocal);
            visitanteIA();

        } else {
            tocaJugar = 'LOCAL';
            $('.local').attr('draggable', 'true');

            $('#tocaJugar').text(tocaJugar);
            $('#tocaJugar').css('color', '#7575fb');

            //COMIENZO DE TURNO LOCAL
            //AL COMIENZO DE TU TURNO LOS ESBIRROS SE DESPERTARÁN Y PODRÁN SER SELECCIONADOS PARA TU SIGUIENTE TURNO
            $('.zzz').removeClass('zzz').attr('draggable', 'true');
            $('.tieneOrden').removeClass('tieneOrden').attr('draggable', 'true');
            //SABEMOS EL NUMERO DE CARTAS QUE TENEMOS EN TABLERO, MANO Y MAZO
            funcionesCantidadCartasManoMazo();

            if (manaVisitante < 10) {
                manaVisitante++;
            }
            $('#marcadorManaVisitante').text(manaVisitante);
        }
    });


}

//SOLTAR CARTAS onmouseover(.enMano) -> click (.soltable) AL TABLERO
function soltarCarta() {

    $(document).on('mouseover', '.carta', function () {
        //Comprobar si la esbirro está en mano
        if ($(this).hasClass('enMano')) {
            $(this).removeClass('col-1');
            $(this).addClass('col-2');
            $(this).css('border', '5px solid #bbbbbb');

            /*
            PREGUNTAR SI TENGO MANALOCAL DISPONIBLE PARA EL ESBIRRO
            RESTAR A MI MANALOCAL EL COSTE DEL ESBIRRO
            REESTABLECER PARA EL TURNO SIGUIENTE EL MANA ANTERIOR +1

             */
            manaEsbirro = $(this).children().first().next().text();

            //console.log("Mana local:  " + manaLocal +" Mana aux: " + manaAux + " costeEsbirro: " + manaEsbirro);
            //Comprobar si tenemos maná suficiente para lanzar la carta al tablero
            if ((manaAux - manaEsbirro) >= 0) {

                $(this).removeClass('seleccionada');
                $(this).removeClass('enMano');
                $(this).css('border', '');
                $(this).addClass('soltable');
            }
        }

    });

    $(document).on('click', '.soltable', function () {
        if (tocaJugar == 'LOCAL') {
            $(this).removeClass('soltable');
            $(this).removeClass('col-1');
            $(this).removeClass('enMano');
            $(this).addClass('zzz');
            $(this).addClass('col-2');
            $('#tableroLocal').children().first().append(this);
            audioSoltarCarta.play();
            funcionesCantidadCartasTablero();
            manaAux = manaAux - manaEsbirro;
            $('#marcadorManaLocal').text(manaAux);
        }
    });
}

//CONTROLAR CANTIDAD CARTAS EN: MANO Y MAZO
function funcionesCantidadCartasManoMazo() {
    //ESTE MÉTODO SE EJECUTA A PRINCIPIO DE TURNO LOCAL

    let CartasTableroLocal = $('#tableroLocal').children().first().children();
    let CartasManoLocal = $('#cartasEnManoLocal').children().first().children().first().children().first().children();
    let CartasMazo = $('#mazoLocal').children();

    let numCartasTableroLocal = $('#tableroLocal').children().first().children().length;
    let numCartasManoLocal = $('#cartasEnManoLocal').children().first().children().first().children().first().children().length;
    let numCartasMazo = $('#mazoLocal').children().length;
    let primeraCartaMazo = $('#mazoLocal').children().first();

    $(primeraCartaMazo).show();

    if (numCartasManoLocal < 10) {
        $('#mazoLocal').addClass('movimientoMazo');
        setTimeout(function quitarClaseMazo() { $('#mazoLocal').removeClass('movimientoMazo'); }, 1000);
        $(CartasManoLocal).parent().append(primeraCartaMazo);
    }
    //NUMERO DE CARTAS EN MANO EXCESIVO
    if (numCartasManoLocal >= 10) {
        $('#mazoLocal').addClass('movimientoMazo');
        setTimeout(function quitarClaseMazo() { $('#mazoLocal').removeClass('movimientoMazo'); }, 1000);

        $('#modal').show();
        $('#tituloModal').text("Una carta fue destruida...");
        $('#pModal').text("No puedes tener más de diez cartas en tu mano");
        setTimeout(function quitarModal() { $('#modal').fadeOut(); }, 2000);

        $(CartasTableroLocal).parent().append(primeraCartaMazo);
        $(primeraCartaMazo).addClass('cartaMuerta');
        setTimeout(function quitarClaseMazo() { $(primeraCartaMazo).remove(); }, 1000);
    }
}

function funcionesCantidadCartasTablero() {
    let CartasTableroLocal = $('#tableroLocal').children().first().children();
    let numCartasTableroLocal = $('#tableroLocal').children().first().children().length;

    if (numCartasTableroLocal == 6) {
        $('#modal').show();
        $('#tituloModal').text("Ten cuidado...");
        $('#pModal').text("No puedes tener más de seis esbirros en tu tablero");
        setTimeout(function quitarModal() { $('#modal').fadeOut(); }, 3000);
    }
    if (numCartasTableroLocal >= 7) {
        $('#modal').show();
        $('#tituloModal').text("Una esbirro fue destruido...");
        $('#pModal').text("No puedes tener más de seis esbirros en tu tablero");
        setTimeout(function quitarModal() { $('#modal').fadeOut(); }, 3000);

        $(CartasTableroLocal).last().addClass('cartaMuerta');
        setTimeout(function quitarClaseMazo() { $(CartasTableroLocal).last().remove(); }, 1000);
    }
}

function visitanteIA() {
    let esbirroVisitante1 = '<div class="carta visitante col-2"><span class="ataque">1</span><span class="coste">0</span><span class="defensa">1</span></div>';
    let esbirroVisitante2 = '<div class="carta visitante col-2"><span class="ataque">3</span><span class="coste">3</span><span class="defensa">3</span></div>';
    let esbirroVisitante3 = '<div class="carta visitante col-2"><span class="ataque">5</span><span class="coste">5</span><span class="defensa">5</span></div>';
    //TURNO VISITANTE
    if (tocaJugar == 'VISITANTE') {
        console.log("Tablero visitante lenght: " + $('#tableroVisitante').children().first().children().length)

        if (turno == 2 || turno == 4 || turno == 6 ) {
            $('#tableroVisitante').children().first().append(esbirroVisitante1);
            $('#tableroVisitante').children().first().children().last().css('display', 'none');
            $('#tableroVisitante').children().first().children().last().fadeIn();

        }
        if (turno == 8 || turno == 10 || turno == 12 ) {
            $('#tableroVisitante').children().first().append(esbirroVisitante2);
            $('#tableroVisitante').children().first().children().last().css('display', 'none');
            $('#tableroVisitante').children().first().children().last().fadeIn();

        }
        if (turno == 14 || turno == 16 || turno == 18 ) {
            $('#tableroVisitante').children().first().append(esbirroVisitante3);
            $('#tableroVisitante').children().first().children().last().css('display', 'none');
            $('#tableroVisitante').children().first().children().last().fadeIn();

        }

        if($('#tableroVisitante').children().first().children().length > 6){
            $('#tableroVisitante').children().first().children().last().remove();
        }
        setTimeout(function clickAutomaticoEspera() { $("#pasarTurno").click(); }, 3000);
    }
}

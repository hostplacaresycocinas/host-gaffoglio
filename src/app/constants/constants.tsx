export const company = {
  dark: false,
  darkmode: true,
  shortAdress: true,
  secondaryColor: false,
  favicon: false,
  price: false,
  objectCover: '50%',
  id: 'gaffogliomultimarcas',
  name: 'Gaffoglio Multimarcas',
  adress: '25 de Mayo 355',
  city: 'Sáenz Peña',
  email: 'hgevans@hotmail.com',
  instagram: 'gaffoglio_multimarcas',
  facebook: 'https://www.facebook.com/profile.php?id=100063556091056',
  whatsapp: ['3644157046', '3644372174'],
  googlemapsLink: 'https://maps.app.goo.gl/ezNHNxqzdPcvjVw4A',
  googlemaps:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3561.6018449242574!2d-60.43899570603463!3d-26.788958838005115!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94412db907ceddf1%3A0x1d719607c13ddbff!2sGaffoglio%20Multimarcas!5e0!3m2!1ses-419!2sar!4v1775272558242!5m2!1ses-419!2sar',
  openHours: [
    'Lunes 8 a 12:30 y 15:30 a 19:30hs',
    'Martes 8 a 12:30 y 15:30 a 19:30hs',
    'Miércoles 8 a 12:30 y 15:30 a 19:30hs',
    'Jueves 8 a 12:30 y 15:30 a 19:30hs',
    'Viernes 8 a 12:30 y 15:30 a 19:30hs',
    'Sábado 8:30 a 12:30hs',
  ],
  footer:
    'Compra y Venta de Autos: Vehículos seleccionados, atención personalizada.',
};

export const API_BASE_URL = 'https://dealership.agenciagrvity.com';
export const TENANT = 'test-automotores';

export const metadataCompany = {
  metadataBase: 'https://gaffogliomultimarcas.vercel.app/',
  title: 'Gaffoglio Multimarcas - Compra y Venta de Autos',
  description:
    'Compra y Venta de Autos: Vehículos seleccionados, atención personalizada.',
};

// Cambie el archivo data.json, necesito que actualices la informacion de catalogo.json. Las images tomalas de images de data.json, la descripcion tomala de caption de data.json, pero necesito que el texto este parseado, que no este todo junto sin espacios y saltos de linea. En name pone la marca y el modelo del vehiculo en title case, marca, marcaId todo esto acorde a la informacion de caption. Si en caption no se dice kilometraje o precio pone 999999, categoria estimala para el vehiculo (categorias tipicas de vehiculos en argentina. como utilitario, deportivo, suv, hatchback, etc). Transmision, motor, combustible y puertas estimalas acorde al vehiculo. La cantidad de vehiculos tiene que ser la de data.json, si en catalogo.json hay otros vehiculos removelos, los vehiclos de catalogo json tienen que ser los mismos que en data.json. No hagas un script, simplemente actualizalo con ia. Si hay vehiculos vendidos igualmente tenes que sumarlos. No cambies el archivo constants.tsx

export const preguntas = [
  {
    id: 'preg-1',
    question: '¿Trabajan con financiación?',
    answer:
      'Sí, trabajamos con opciones de financiación para que puedas acceder al vehículo que buscás. Te asesoramos sobre las mejores alternativas disponibles según tu situación. Contactanos para conocer los planes y requisitos.',
  },
  {
    id: 'preg-2',
    question: '¿Los autos pasan por alguna revisión técnica?',
    answer:
      'Todos los vehículos que ofrecemos son inspeccionados por nuestro equipo técnico. Revisamos el estado general, mecánica, documentación y funcionamiento para asegurarte un auto en las mejores condiciones posibles.',
  },
  {
    id: 'preg-3',
    question: '¿Qué documentación necesito para comprar?',
    answer:
      'Necesitás tu DNI vigente y constancia de ingresos. Si vas a financiar, pueden pedirte documentación adicional. Te detallamos todos los requisitos cuando te contactes con nosotros y te ayudamos con el proceso.',
  },
  {
    id: 'preg-4',
    question: '¿Puedo probar el auto antes de comprarlo?',
    answer:
      'Por supuesto, podés venir a conocer y probar el vehículo que te interese. Agendamos una cita para que lo veas personalmente, lo pruebes y resuelvas todas tus consultas. Te invitamos a visitarnos.',
  },
  {
    id: 'preg-5',
    question: '¿Dan algún tipo de respaldo después de la compra?',
    answer:
      'Sí, seguimos acompañándote después de la compra. Si tenés alguna consulta o necesitás asesoramiento sobre el mantenimiento o cualquier tema relacionado con tu vehículo, podés contactarnos cuando quieras.',
  },
];

export const navigation = [
  {
    id: '0',
    title: 'Inicio',
    url: '/',
  },
  {
    id: '1',
    title: 'Usados',
    url: '/catalogo',
  },
  {
    id: '2',
    title: '0km',
    url: '/0km',
  },
  {
    id: '3',
    title: 'Nosotros',
    url: '/nosotros',
  },
  {
    id: '4',
    title: 'Contacto',
    url: '/contacto',
    button: true,
  },
];

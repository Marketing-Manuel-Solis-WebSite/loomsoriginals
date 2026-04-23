-- Loom Originals — seed data
-- Run once after 0001_init.sql + 0002_indexes.sql
-- NOTE: YouTube IDs marked PLACEHOLDER_* must be replaced via /admin
--       before production launch.
-- ─────────────────────────────────────────────────────────────────────

begin;

-- ─────────────────────────────────────────────────────────────────────
-- Categories
-- ─────────────────────────────────────────────────────────────────────
insert into public.categories (slug, name_es, name_en, description_es, description_en) values
  ('reunificacion-familiar', 'Reunificación Familiar', 'Family Reunification',
   'Historias de familias que lograron volver a estar juntas tras años de espera.',
   'Stories of families who reunited after years apart.'),
  ('asilo', 'Asilo', 'Asylum',
   'Testimonios de personas que encontraron protección en Estados Unidos.',
   'Testimonies of people who found protection in the United States.'),
  ('visas-de-trabajo', 'Visas de Trabajo', 'Work Visas',
   'El camino laboral hacia la residencia legal.',
   'The work path toward legal residence.'),
  ('ciudadania', 'Ciudadanía', 'Citizenship',
   'Del residente permanente al ciudadano estadounidense.',
   'From permanent resident to U.S. citizen.'),
  ('deportacion', 'Deportación y Defensa', 'Deportation Defense',
   'Estrategias de defensa contra procesos de remoción.',
   'Defense strategies against removal proceedings.'),
  ('casos-reales', 'Casos Reales', 'Real Cases',
   'Casos reales del Bufete Manuel Solís, contados por sus protagonistas.',
   'Real cases from Bufete Manuel Solís, told by the people who lived them.')
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- Series
-- ─────────────────────────────────────────────────────────────────────
insert into public.series (slug, title_es, title_en, synopsis_es, synopsis_en,
                           trailer_youtube_id, release_year, is_featured, featured_order)
values (
  'uniendo-familias-manuel-solis',
  'Uniendo Familias con Manuel Solís',
  'Reuniting Families with Manuel Solís',
  'Cada episodio sigue a una familia real mientras reconstruye su vida en Estados Unidos, desde la primera petición migratoria hasta el abrazo en el aeropuerto. Narrado con la voz de las familias y el equipo legal del Bufete Manuel Solís.',
  'Each episode follows a real family as they rebuild their lives in the United States, from the first immigration petition to the airport reunion. Told in the voice of the families and the legal team at Bufete Manuel Solís.',
  'PLACEHOLDER_TRAILER',
  2026,
  true,
  1
)
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- Season 1
-- ─────────────────────────────────────────────────────────────────────
with s as (
  select id from public.series where slug = 'uniendo-familias-manuel-solis'
)
insert into public.seasons (series_id, season_number, title_es, title_en)
select s.id, 1, 'Primera Temporada', 'Season One' from s
on conflict (series_id, season_number) do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- Episodes (8 total)
-- ─────────────────────────────────────────────────────────────────────
-- We use a common table expression to fetch series/season ids once and
-- insert all 8 episodes at once.

with series_info as (
  select s.id as series_id, se.id as season_id
  from public.series s
  join public.seasons se on se.series_id = s.id and se.season_number = 1
  where s.slug = 'uniendo-familias-manuel-solis'
)
insert into public.episodes (
  season_id, series_id, episode_number, slug,
  title_es, title_en, synopsis_es, synopsis_en,
  youtube_id, duration_seconds, transcript_es,
  published_at, is_published, tags
)
select season_id, series_id, ep.episode_number, ep.slug,
       ep.title_es, ep.title_en, ep.synopsis_es, ep.synopsis_en,
       ep.youtube_id, ep.duration_seconds, ep.transcript_es,
       ep.published_at::timestamptz, true, ep.tags::text[]
from series_info, (values
  (
    1,
    'la-peticion-de-rosa',
    'La petición de Rosa',
    'Rosa''s Petition',
    'Rosa esperó catorce años para pedir a su hijo desde Guatemala. Cuando finalmente el I-130 fue aprobado, Manuel Solís recibió la llamada a las tres de la mañana. Esta es la historia de una madre que nunca dejó de llenar formularios, ni de rezar.',
    'Rosa waited fourteen years to petition for her son from Guatemala. When the I-130 was finally approved, Manuel Solís got the call at three in the morning.',
    'PLACEHOLDER_EP1',
    1098,
    'Rosa llegó a Houston en el año dos mil nueve con dos cosas en la mano: una mochila con ropa para tres días y una fotografía de su hijo de seis años. No sabía que pasarían catorce navidades antes de volver a abrazarlo. La primera vez que vino al bufete, lloró toda la consulta. Manuel recuerda que le dijo, con esa forma suya de hablar pausado, "doña Rosa, yo no le puedo prometer que sea rápido, pero sí le prometo que no va a estar sola en esto." Y cumplió. Durante catorce años, el equipo de Bufete Manuel Solís acompañó cada paso. Primero la residencia de Rosa a través de su esposo, ciudadano americano. Después la petición familiar, el famoso I-130, para su hijo Diego que ya tenía diecisiete años y estaba por cumplir la edad en que los tiempos de espera cambian drásticamente. El visado se tardó porque Diego quedó atrapado en la categoría F2B, hijo soltero mayor de edad de residente permanente, una de las más lentas del sistema migratorio. Rosa no fallaba una llamada al bufete. Cada seis meses preguntaba lo mismo: "licenciada, ¿ya movió mi hijo en la fila?" Y cada seis meses la respuesta era la misma. Hasta que una mañana de enero, a las tres y cuarto, sonó el teléfono de Manuel. Era la mamá, porque Rosa siempre hablaba directo con él cuando podía. "Licenciado, me llamó Diego, le llegó el correo del consulado, sí le tocó la cita." Manuel guardó silencio un segundo y después le dijo, "ya estamos, doña Rosa. Vamos a prepararlo para la entrevista." En esta historia verá cómo una familia rearmó el rompecabezas: la entrevista consular en Ciudad de Guatemala, el examen médico, el certificado policial, el viaje del hijo desde el aeropuerto La Aurora hasta el terminal C de George Bush Intercontinental. Verá la mano del abuelo en el pasillo de migración, y escuchará de boca del propio Diego, ya de treinta y un años, cómo era mirar las fotos de su mamá cada noche sin saber cuándo volvería a tocarle la cara. El I-130 no es un formulario. Es una promesa de tiempo. En Loom Originals creemos que esas promesas merecen ser contadas completas.',
    '2026-01-15T08:00:00-06:00',
    '{"I-130","F2B","Guatemala","reunificación","Houston"}'
  ),
  (
    2,
    'asilo-para-andrea',
    'Asilo para Andrea',
    'Asylum for Andrea',
    'Andrea huyó de Honduras con su hija de cinco años después de que su expareja amenazara con matarla. El abogado inicial le dijo que no calificaba. Un año después, encontró al equipo correcto.',
    'Andrea fled Honduras with her five-year-old daughter after her ex-partner threatened to kill her. The first lawyer told her she did not qualify. A year later, she found the right team.',
    'PLACEHOLDER_EP2',
    1340,
    'Cuando Andrea cruzó el puente internacional en Hidalgo, Texas, lo hizo con su hija en brazos y con un número de teléfono escrito en un pedazo de papel higiénico metido dentro del sostén. Ese número era de una prima lejana. Nadie le dijo que iba a pasar casi dos años detenida en un centro de procesamiento familiar en Dilley antes de tocar aire libre. Su primer abogado le dijo que el asilo era muy difícil, que su caso no entraba en ninguna de las cinco categorías reconocidas: raza, religión, nacionalidad, opinión política, pertenencia a un grupo social particular. Le sugirió que aceptara la deportación voluntaria. Andrea firmó los papeles y luego se arrepintió. Volvió a pedir revisión. En el tiempo entre la primera audiencia y la segunda, encontró, por medio de una amiga de la iglesia, al Bufete Manuel Solís. La licenciada Ramírez, parte del equipo del bufete, tomó el caso sin cobrarle consulta. Le explicó que la violencia doméstica sistemática, combinada con el fracaso del Estado hondureño en proteger a las mujeres, podía constituir persecución por pertenencia a un grupo social particular bajo los precedentes de Matter of A-R-C-G- y jurisprudencia posterior. Armaron el caso pieza por pieza. Andrea consiguió reportes policiales sellados, fotografías de moretones, mensajes de texto de amenazas que había guardado por años en un correo de Yahoo, y la declaración de la hermana de su expareja confirmando que sí, que el hombre había dicho que iba a matarla si regresaba. La psicóloga forense pro bono, contratada por el bufete, diagnosticó trastorno de estrés postraumático complejo. La audiencia de méritos duró seis horas. La juez Romero, conocida en el circuito por ser estricta con los asilos centroamericanos, hizo más de cincuenta preguntas. Andrea contestó cada una, en español, traducida por la intérprete oficial, mirando siempre al piso. Cuando la juez anunció "grant", concedido, Andrea no entendió la palabra. La licenciada le tocó el hombro y le dijo, "Andrea, ganamos, ya tiene asilo." Hoy Andrea tiene green card desde hace tres años y su hija, ya de diez, acaba de ganar el concurso de ortografía de su escuela en Pasadena. En este episodio la escuchará contar, por primera vez frente a una cámara, lo que significa haber firmado un papel que casi le costó la vida, y cómo una segunda opinión le devolvió el futuro.',
    '2026-01-22T08:00:00-06:00',
    '{"asilo","violencia doméstica","Honduras","grupo social particular","VAWA-adjacent"}'
  ),
  (
    3,
    'vawa-el-silencio-de-carmen',
    'VAWA: el silencio de Carmen',
    'VAWA: Carmen''s Silence',
    'Carmen no sabía que podía pedir residencia sin el permiso de su esposo. Tampoco sabía que su esposo era el que la tenía así.',
    'Carmen did not know she could apply for residence without her husband''s permission. She also did not know her husband was the reason she was trapped.',
    'PLACEHOLDER_EP3',
    1205,
    'La Violence Against Women Act, conocida como VAWA, es un camino migratorio poco entendido. Permite que víctimas de violencia doméstica, cuyo cónyuge es ciudadano o residente legal permanente, soliciten su residencia sin depender de la petición del agresor. Es un mecanismo creado por el Congreso en mil novecientos noventa y cuatro precisamente porque el sistema migratorio tradicional ataba a las víctimas a sus abusadores. Carmen nos dice al inicio de su testimonio que ella pensaba que el único camino para arreglar sus papeles era que su esposo, ciudadano americano, presentara el I-130. Por dieciséis años, él le repitió que si lo dejaba, la iba a reportar a migración. La primera vez que Carmen escuchó la palabra VAWA fue en una reunión de mujeres en una iglesia bautista en Pasadena. Una abogada del Bufete Manuel Solís dio una plática gratuita. Carmen se quedó hasta el final, pero no se acercó. Volvió a casa, esperó tres meses, y un domingo después de misa llamó al número que le habían dado. "Mi nombre es Carmen, tengo una pregunta, pero no sé si me puedo beneficiar." La consulta inicial duró dos horas. Carmen trajo recibos médicos de visitas a urgencias, reportes del departamento del sheriff que nunca habían llegado a cargos formales, y una llave. La llave era de una caja de seguridad en un banco donde había guardado fotos de lesiones, escondidas de su esposo por años. El equipo legal armó el paquete de VAWA con la autopetición I-360, la solicitud de ajuste de estatus I-485, y una declaración personal de quince páginas que Carmen escribió a mano durante seis sesiones con una trabajadora social del bufete. El caso fue aprobado en trece meses. Hoy Carmen vive sola en un departamento de un cuarto en Aldine, tiene green card, y trabaja como asistente en una clínica dental. Su historia, que en este episodio cuenta con el rostro pixelado para proteger su seguridad, ilustra por qué el desconocimiento del sistema es en sí mismo una forma de atrapamiento. Si usted o alguien que conoce está en una situación similar, el episodio incluye al final una guía paso a paso del proceso VAWA, presentada por el abogado Manuel Solís en cámara.',
    '2026-01-29T08:00:00-06:00',
    '{"VAWA","violencia doméstica","I-360","autopetición","Pasadena"}'
  ),
  (
    4,
    'la-visa-h1b-de-ernesto',
    'La visa H-1B de Ernesto',
    'Ernesto''s H-1B Visa',
    'Ernesto estudió ingeniería de software en Monterrey, trabajó tres años en una compañía de Austin con OPT, y tenía noventa días para ganarse un patrocinio H-1B antes de tener que volverse a México.',
    'Ernesto studied software engineering in Monterrey, worked three years at an Austin company on OPT, and had ninety days to win an H-1B sponsorship before having to return to Mexico.',
    'PLACEHOLDER_EP4',
    1156,
    'La H-1B es la visa que más confunde a trabajadores calificados y a empresas por igual. Tiene un tope anual de sesenta y cinco mil visas, más veinte mil adicionales para titulares de maestría americana. Cada primero de abril empieza la lotería. Las probabilidades, dependiendo del año, rondan entre quince y veinticinco por ciento. Ernesto tenía que jugar esa lotería tres veces para darse una oportunidad estadística razonable de ganar. Había empezado con una F-1, visa de estudiante, en Texas A&M. Se graduó con honores, consiguió OPT, Optional Practical Training, que le dio doce meses de trabajo autorizado. Después, al ser STEM, extendió OPT por veinticuatro meses más. Al final del segundo año de OPT STEM, su compañía todavía no lo había entrado en la lotería H-1B. El gerente de recursos humanos le decía que "estaban evaluando." Ernesto vino al Bufete Manuel Solís cuando le quedaban ciento veinte días de OPT. El diagnóstico fue directo: la empresa estaba demorando porque el proceso H-1B les cuesta entre cuatro y seis mil dólares por empleado, y querían esperar a ver si Ernesto duraba. El abogado le ayudó a redactar una propuesta interna, armado con data del mercado laboral, que convenció a la empresa de meterlo en la lotería. No ganó. El año siguiente tampoco. Ernesto estaba en su último año de OPT STEM y las opciones se cerraban. El bufete lo guió a un plan B que pocas personas consideran: una O-1, visa para personas con habilidad extraordinaria. Ernesto tenía tres publicaciones en conferencias internacionales, dos patentes pendientes, y cartas de recomendación de colegas en Google y Meta. Con ese material, y con meses de trabajo de documentación, la petición O-1 fue aprobada. Tres años después, ya con una carga de publicaciones más grande, el bufete presentó una EB-1A, residencia por habilidad extraordinaria, sin necesidad de patrocinador. Ernesto hoy tiene su green card y acaba de comprar casa en Cedar Park. En este episodio él explica paso a paso lo que aprendió del sistema, qué haría diferente si pudiera empezar de nuevo, y por qué cree que el mito de "la H-1B o nada" le costó dos años de estrés innecesario.',
    '2026-02-05T08:00:00-06:00',
    '{"H-1B","OPT","O-1","EB-1A","Austin","tecnología"}'
  ),
  (
    5,
    'ciudadanos-del-domingo',
    'Ciudadanos del domingo',
    'Sunday Citizens',
    'La ceremonia de naturalización del primer domingo del mes en Houston reúne a trescientas personas que vienen de sesenta países distintos. Este episodio las acompaña.',
    'The naturalization ceremony on the first Sunday of each month in Houston brings together three hundred people from sixty different countries. This episode walks with them.',
    'PLACEHOLDER_EP5',
    1398,
    'El juramento de lealtad dura cuarenta y siete segundos. La ceremonia entera dura dos horas, pero el momento exacto en que una persona se convierte en ciudadano americano tarda menos de un minuto. Para llegar ahí, la mayoría de los presentes llevan entre cinco y veinte años de proceso. Este episodio se grabó durante seis meses en la corte federal de Houston, con permiso del juez presidente y con el apoyo del equipo del Bufete Manuel Solís que atiende a muchos de los solicitantes. Conocemos a tres protagonistas. Mirna, enfermera de El Salvador, llegó hace dieciocho años. Pasó por TPS, luego por un matrimonio con ciudadano, después por una green card condicional de dos años, después por la remoción de condiciones con I-751, después por el período de espera de cinco años para la N-400. Mirna reprobó la primera vez el examen de civismo por nervios. El bufete la preparó con sesiones de práctica semanales durante dos meses. La segunda vez pasó con cien por ciento. Héctor, carnicero de Ciudad Juárez, llegó con visa de trabajo temporal. Tardó once años en acomodar su caso de residencia por empleo. Cuando por fin lo citaron para la entrevista de naturalización, el oficial le hizo las diez preguntas de civismo en inglés. Héctor contestó ocho correctas. El oficial le preguntó si quería seguir. Héctor dijo que sí. La novena, "¿Quién fue el primer presidente?", la contestó sin dudar: George Washington. La décima también. Aprobado. Y está María José, originaria de Venezuela, residente por asilo aprobado hace siete años. Para ella la naturalización significa poder pedir a su hermano, que todavía está en Caracas. Porque un ciudadano puede pedir hermanos. Un residente no. La escena final del episodio es la ceremonia en el tribunal. Verá las banderas pequeñas que reparten a cada nuevo ciudadano, verá el momento en que alguien tiembla al levantar la mano derecha. Escuchará, en la voz de Manuel Solís, la frase con la que acostumbra despedir a sus clientes el día que prestan juramento: "la residencia es un permiso, la ciudadanía es un derecho." Porque son cosas distintas, y merece la pena saberlo.',
    '2026-02-12T08:00:00-06:00',
    '{"naturalización","N-400","ciudadanía","examen de civismo","Houston"}'
  ),
  (
    6,
    'la-carta-de-don-julio',
    'La carta de don Julio',
    'Don Julio''s Letter',
    'Don Julio tiene ochenta y un años, diabetes tipo dos, y una notificación de corte para el mes que viene. Su familia entera cabe en dos autos. Este episodio cuenta su defensa contra la deportación.',
    'Don Julio is eighty-one years old, has type two diabetes, and a court notice for next month. His entire family fits in two cars. This episode tells the story of his defense against removal.',
    'PLACEHOLDER_EP6',
    1522,
    'Cuando una persona recibe un Notice to Appear, un NTA, el reloj empieza. En Houston la corte de inmigración está atrasada más de cuatro años, pero los casos con adultos mayores o problemas médicos pueden moverse rápido. El caso de don Julio cayó en manos del equipo del Bufete Manuel Solís tres semanas antes de su primera audiencia master. La estrategia de defensa dependía de identificar el alivio correcto. Don Julio llevaba treinta y dos años en Estados Unidos. Sus hijos eran residentes, sus nietos ciudadanos. Nunca había tenido problemas con la ley, excepto una falta menor de veinte años atrás por manejar sin licencia. Sobre el papel, parecía un candidato para cancelación de remoción para no residentes bajo INA sección 240A(b), que requiere, entre otras cosas, diez años de presencia continua, buen carácter moral, y que la remoción causaría "hardship excepcional y extremadamente inusual" a un familiar ciudadano o residente. El hardship era el desafío. No basta con "mi familia me va a extrañar." Se requiere demostrar consecuencias médicas, económicas o educativas que vayan mucho más allá de lo normal. El equipo legal reunió expedientes médicos. Don Julio tenía diabetes tipo dos insulinodependiente y un marcapasos instalado hacía cuatro años. Su esposa, residente, tenía alzhéimer en etapa temprana y dependía de don Julio para toma de medicamentos diaria. Sus hijos trabajaban jornadas de diez horas y no podían sustituirlo. La declaración del cardiólogo decía, en su parte clave, que la interrupción del tratamiento existente y el viaje internacional, combinados con el estrés del desarraigo, presentaban riesgo cardiovascular significativo. La declaración de la neuróloga de la esposa decía que un cambio abrupto de cuidador podría acelerar el deterioro cognitivo. El equipo presentó todo esto ante la juez Ayala en una audiencia de méritos que duró cinco horas. La juez tomó el caso bajo advisement, en reserva, por cuatro semanas. La tarde del quinto jueves, la decisión llegó por correo. Concedida la cancelación. Don Julio recibió su green card nueve meses después. Hoy, sentado en la sala de su casa en Pasadena, rodeado de nietos, lee la carta que escribió para el juicio, la misma que nunca terminó de leer en voz alta porque se le quebró la voz. La lee completa en este episodio. Dura tres minutos y dice, entre otras cosas, "yo no vine a este país a quitarle nada a nadie, yo vine a trabajar, a criar a mis hijos, y a morir cuando Dios diga, en esta tierra que me ha dado todo."',
    '2026-02-19T08:00:00-06:00',
    '{"cancelación de remoción","240A","hardship","deportación","adultos mayores"}'
  ),
  (
    7,
    'la-peticion-olvidada',
    'La petición olvidada',
    'The Forgotten Petition',
    'En mil novecientos noventa y seis, el padre de Luis presentó una petición I-130 por él. Veintisiete años después, un funcionario del consulado le preguntó por qué nunca respondió.',
    'In nineteen ninety-six, Luis''s father filed an I-130 petition for him. Twenty-seven years later, a consular officer asked why he never responded.',
    'PLACEHOLDER_EP7',
    1089,
    'Una de las trampas más silenciosas del sistema migratorio estadounidense son las peticiones antiguas. El USCIS procesa casi nueve millones de casos al año y guarda registros de todas las peticiones familiares aprobadas. Muchas de ellas llegan al National Visa Center, el NVC, y allí esperan a que la visa esté disponible. Cuando la visa llega, el NVC manda una carta con instrucciones. Si esa carta llega a una dirección vieja, y el solicitante no actualiza, el expediente queda "terminado" sin que nadie se entere. Luis nació en Michoacán en mil novecientos ochenta y dos. Su padre se vino a Estados Unidos en mil novecientos ochenta y ocho. Obtuvo residencia por la amnistía de Reagan. En mil novecientos noventa y seis, pidió a su hijo mayor, Luis, mediante I-130. En aquel entonces Luis tenía catorce años. En dos mil cuatro, el padre aplicó y obtuvo la ciudadanía. La petición se reclasificó, se volvió inmediate relative, y la visa, teóricamente, quedó disponible al instante. Pero la carta del NVC llegó a la dirección de Pharr, Texas, donde el padre ya no vivía. Nadie la abrió. La petición quedó en abandono. Luis creció pensando que el trámite seguía en fila. Vivió en Michoacán, se casó, tuvo dos hijos, trabajó de plomero. En dos mil veintitrés, ya con padre muerto, intentó aplicar por sí mismo para una visa de turista. El consulado le negó y le dijo, casi como dato curioso, "usted tenía una petición aprobada desde dos mil cuatro que fue abandonada." Luis no entendió qué significaba eso. Le dieron un folleto y lo despacharon. Unos meses después, una prima que vive en Houston se enteró de la historia y le dijo a Luis que llamara al Bufete Manuel Solís. El bufete pidió los archivos mediante una solicitud FOIA, Freedom of Information Act, y descubrió que la petición, técnicamente, se podía reactivar si se demostraba que el abandono fue involuntario y que la persona no había sido notificada en una dirección válida. El caso tardó un año y medio. Hoy Luis está en proceso consular y tiene cita en Ciudad Juárez para su entrevista. En este episodio él y su madre, ya viuda, cuentan lo que es vivir veintisiete años pensando que el papel llega pronto, y descubrir que el papel llegó, pero a una casa vacía. Es también un recordatorio práctico: si usted o alguien en su familia tiene una petición vieja, vale la pena verificar con FOIA antes de asumir nada.',
    '2026-02-26T08:00:00-06:00',
    '{"I-130","NVC","FOIA","petición abandonada","Michoacán"}'
  ),
  (
    8,
    'lo-que-aprendimos',
    'Lo que aprendimos',
    'What We Learned',
    'Capítulo final de la primera temporada. Manuel Solís sienta en su oficina a tres familias de episodios anteriores para una conversación abierta sobre lo que sigue.',
    'Season one finale. Manuel Solís sits down in his office with three families from prior episodes for an open conversation about what comes next.',
    'PLACEHOLDER_EP8',
    1678,
    'El cierre de temporada es distinto a los otros episodios. No hay una familia que rescatar, no hay un caso que armar, no hay un final de aeropuerto. Es una conversación. En la mesa de la oficina, en la calle Bissonnet, están Rosa del episodio uno, Andrea del episodio dos, y don Julio del episodio seis. Manuel Solís hace preguntas y también las contesta. La primera pregunta la hace Andrea. Le pregunta a Rosa cómo sostuvo catorce años de espera sin darse por vencida. Rosa responde que cuando uno tiene un hijo del otro lado, el no rendirse no es una virtud, es una obligación. Don Julio interviene para decir que él llegó en mil novecientos noventa y uno, que nunca quiso sacar papeles mal hechos, que siempre supo que algún día iba a tocar, y que el miedo más grande no era la deportación sino dejar a los nietos sin abuelo. Manuel les pregunta qué le dirían a alguien que está empezando el proceso hoy. Rosa dice que busque un abogado que le conteste las llamadas. Andrea dice que no se quede con la primera opinión si la primera opinión dice que no se puede. Don Julio dice que guarde cada papel, cada recibo, cada contrato, porque lo que un día parece basura un día es evidencia. Manuel, al final, habla de algo que pocas veces dice en cámara. Dice que lleva treinta y un años ejerciendo inmigración, que ha perdido casos, que ha llorado con familias, que sabe que el sistema es más lento de lo que debería, que no siempre es justo, y que por eso mismo se quedó. "Yo no escogí esta área del derecho por la plata," dice. "La escogí porque mi propia madre hizo cola en un consulado una vez y le dijeron que no, y ese no cambió toda la historia de mi familia." El episodio cierra con una panorámica del equipo del bufete en la reunión semanal del lunes, y con una frase escrita en pantalla: "la segunda temporada empieza en mayo. Si tiene una historia que merece ser contada, escríbanos a historias@loomsoriginal.com." Esta es una serie sobre familias, pero también sobre un país que todavía está decidiendo qué quiere ser con sus migrantes. Gracias por acompañarnos en la primera temporada.',
    '2026-03-05T08:00:00-06:00',
    '{"especial","conversación","temporada 1","finale"}'
  )
) as ep(episode_number, slug, title_es, title_en, synopsis_es, synopsis_en, youtube_id, duration_seconds, transcript_es, published_at, tags)
on conflict (season_id, episode_number) do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- Episode ↔ Category relations
-- ─────────────────────────────────────────────────────────────────────
insert into public.episode_categories (episode_id, category_id)
select e.id, c.id
from public.episodes e, public.categories c
where
  (e.slug = 'la-peticion-de-rosa'           and c.slug in ('reunificacion-familiar','casos-reales')) or
  (e.slug = 'asilo-para-andrea'             and c.slug in ('asilo','casos-reales')) or
  (e.slug = 'vawa-el-silencio-de-carmen'    and c.slug in ('asilo','reunificacion-familiar','casos-reales')) or
  (e.slug = 'la-visa-h1b-de-ernesto'        and c.slug in ('visas-de-trabajo','casos-reales')) or
  (e.slug = 'ciudadanos-del-domingo'        and c.slug in ('ciudadania','casos-reales')) or
  (e.slug = 'la-carta-de-don-julio'         and c.slug in ('deportacion','casos-reales')) or
  (e.slug = 'la-peticion-olvidada'          and c.slug in ('reunificacion-familiar','casos-reales')) or
  (e.slug = 'lo-que-aprendimos'             and c.slug in ('casos-reales'))
on conflict do nothing;

commit;

-- Loom Originals — solo categorías (sin episodios de ejemplo)
-- Úselo si escogió "Opción B" y quiere las 6 categorías prellenadas.
-- Corra solo una vez.
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

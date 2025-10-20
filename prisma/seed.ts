

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// IDs fixes pour référence
const MAGAZINE_CATEGORY_ID = 'd20b7566-105a-47f3-947f-dab773bef43e';
const HEBERGEMENTS_CATEGORY_ID = 'ad66f5d9-5f9f-4e2d-8d1f-6d2e5d5f6f5f';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Purge toutes les tables dans l'ordre des dépendances
  await prisma.comment.deleteMany();
  await prisma.articleRelatedArticle.deleteMany();
  await prisma.articleTranslation.deleteMany();
  await prisma.article.deleteMany();
  await prisma.placeTranslation.deleteMany();
  await prisma.detailsAccommodation.deleteMany();
  await prisma.place.deleteMany();
  await prisma.authorTranslation.deleteMany();
  await prisma.author.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  // Supprimer d'abord les sous-catégories (qui ont un parentId)
  await prisma.category.deleteMany({ where: { parentId: { not: null } } });
  // Puis les catégories racines
  await prisma.category.deleteMany({ where: { parentId: null } });

  // =====================================================
  // CATEGORIES
  // =====================================================
  console.log('📁 Seeding categories...');

  const magazine = await prisma.category.create({
    data: {
      id: MAGAZINE_CATEGORY_ID,
      slug: 'magazine',
      iconName: 'openmoji:newspaper',
      isActive: true,
      displayOrder: 1,
      translations: {
        create: [
          { langCode: 'fr', name: 'Magazine', seoSlug: 'magazine', description: 'Découvrez les dernières actualités, bons plans et histoires qui font la richesse d\'Annecy et de sa région.' },
          { langCode: 'en', name: 'Magazine', seoSlug: 'magazine', description: 'Discover the latest news, deals and stories that make Annecy and its region so special.' },
          { langCode: 'es', name: 'Revista', seoSlug: 'revista', description: 'Descubre las últimas noticias, ofertas e historias que hacen de Annecy y su región algo especial.' },
          { langCode: 'de', name: 'Magazin', seoSlug: 'magazin', description: 'Entdecken Sie die neuesten Nachrichten, Angebote und Geschichten aus Annecy und der Region.' },
          { langCode: 'zh', name: '杂志', seoSlug: 'zazhi', description: '发现安纳西及其地区的最新新闻、优惠和故事。' },
          { langCode: 'ar', name: 'مجلة', seoSlug: 'majalla', description: 'اكتشف آخر الأخبار والعروض والقصص التي تجعل أنسي والمنطقة مميزة.' },
        ]
      }
    }
  });
  const hebergements = await prisma.category.create({
    data: {
      id: HEBERGEMENTS_CATEGORY_ID,
      slug: 'hebergements',
      iconName: 'openmoji:bed',
      isActive: true,
      displayOrder: 2,
      translations: {
        create: [
          { langCode: 'fr', name: 'Hébergements', seoSlug: 'hebergements', description: 'Trouvez le logement idéal pour votre séjour à Annecy.' },
          { langCode: 'en', name: 'Accommodations', seoSlug: 'accommodations', description: 'Find the perfect place to stay in Annecy.' },
          { langCode: 'es', name: 'Alojamientos', seoSlug: 'alojamientos', description: 'Encuentra el alojamiento perfecto para tu estancia en Annecy.' },
          { langCode: 'de', name: 'Unterkünfte', seoSlug: 'unterkuenfte', description: 'Finden Sie die perfekte Unterkunft für Ihren Aufenthalt in Annecy.' },
          { langCode: 'zh', name: '住宿', seoSlug: 'zhusu', description: '为您的安纳西之旅找到理想的住宿。' },
          { langCode: 'ar', name: 'إقامة', seoSlug: 'iqama', description: 'اعثر على مكان الإقامة المثالي لإقامتك في أنسي.' },
        ]
      }
    }
  });

  // Sous-catégories Magazine
  const actualites = await prisma.category.create({
    data: {
      parentId: MAGAZINE_CATEGORY_ID,
      slug: 'actualites',
      iconName: 'openmoji:newspaper',
      isActive: true,
      displayOrder: 1,
      translations: { create: [
        { langCode: 'fr', name: 'Actualités', seoSlug: 'actualites', description: 'Les dernières nouvelles d\'Annecy et de sa région.' },
        { langCode: 'en', name: 'News', seoSlug: 'news', description: 'Latest news from Annecy and its region.' },
        { langCode: 'es', name: 'Noticias', seoSlug: 'noticias', description: 'Las últimas noticias de Annecy y su región.' },
        { langCode: 'de', name: 'Nachrichten', seoSlug: 'nachrichten', description: 'Die neuesten Nachrichten aus Annecy und der Region.' },
        { langCode: 'zh', name: '新闻', seoSlug: 'xinwen', description: '安纳西及其地区的最新新闻。' },
        { langCode: 'ar', name: 'أخبار', seoSlug: 'akhbar', description: 'آخر الأخبار من أنسي والمنطقة.' },
      ] }
    }
  });
  const culture = await prisma.category.create({
    data: {
      parentId: MAGAZINE_CATEGORY_ID,
      slug: 'culture',
      iconName: 'openmoji:artist-palette',
      isActive: true,
      displayOrder: 2,
      translations: { create: [
        { langCode: 'fr', name: 'Culture', seoSlug: 'culture', description: 'Événements culturels, expositions et spectacles à Annecy.' },
        { langCode: 'en', name: 'Culture', seoSlug: 'culture', description: 'Cultural events, exhibitions and shows in Annecy.' },
        { langCode: 'es', name: 'Cultura', seoSlug: 'cultura', description: 'Eventos culturales, exposiciones y espectáculos en Annecy.' },
        { langCode: 'de', name: 'Kultur', seoSlug: 'kultur', description: 'Kulturelle Veranstaltungen, Ausstellungen und Shows in Annecy.' },
        { langCode: 'zh', name: '文化', seoSlug: 'wenhua', description: '安纳西的文化活动、展览和演出。' },
        { langCode: 'ar', name: 'ثقافة', seoSlug: 'thaqafa', description: 'فعاليات ثقافية ومعارض وعروض في أنسي.' },
      ] }
    }
  });
  const bonPlans = await prisma.category.create({
    data: {
      parentId: MAGAZINE_CATEGORY_ID,
      slug: 'bon-plans',
      iconName: 'openmoji:money-bag',
      isActive: true,
      displayOrder: 3,
      translations: { create: [
        { langCode: 'fr', name: 'Bon Plans', seoSlug: 'bon-plans', description: 'Les meilleures offres et astuces pour profiter d\'Annecy.' },
        { langCode: 'en', name: 'Deals', seoSlug: 'deals', description: 'Best offers and tips to enjoy Annecy.' },
        { langCode: 'es', name: 'Ofertas', seoSlug: 'ofertas', description: 'Las mejores ofertas y consejos para disfrutar de Annecy.' },
        { langCode: 'de', name: 'Angebote', seoSlug: 'angebote', description: 'Die besten Angebote und Tipps für Annecy.' },
        { langCode: 'zh', name: '优惠', seoSlug: 'youhui', description: '享受安纳西的最佳优惠和技巧。' },
        { langCode: 'ar', name: 'عروض', seoSlug: 'urood', description: 'أفضل العروض والنصائح للاستمتاع بأنسي.' },
      ] }
    }
  });

  // Sous-catégories Hébergements
  const hotels = await prisma.category.create({
    data: {
      parentId: HEBERGEMENTS_CATEGORY_ID,
      slug: 'hotels',
      iconName: 'openmoji:hotel',
      isActive: true,
      displayOrder: 1,
      translations: { create: [
        { langCode: 'fr', name: 'Hôtels', seoSlug: 'hotels', description: 'Hôtels à Annecy pour tous les budgets.' },
        { langCode: 'en', name: 'Hotels', seoSlug: 'hotels', description: 'Hotels in Annecy for all budgets.' }
      ] }
    }
  });
  const chambresHotes = await prisma.category.create({
    data: {
      parentId: HEBERGEMENTS_CATEGORY_ID,
      slug: 'chambres-hotes',
      iconName: 'openmoji:house',
      isActive: true,
      displayOrder: 2,
      translations: { create: [
        { langCode: 'fr', name: 'Chambres d\'hôtes', seoSlug: 'chambres-hotes', description: 'Séjournez chez l\'habitant pour une expérience authentique.' },
        { langCode: 'en', name: 'Bed & Breakfast', seoSlug: 'bed-breakfast', description: 'Stay with locals for an authentic experience.' }
      ] }
    }
  });

  // =====================================================
  // AUTHORS
  // =====================================================
  console.log('✍️ Seeding authors...');

  const marie = await prisma.author.create({
    data: {
      slug: 'marie-dubois',
      name: 'Marie Dubois',
      profileImageUrl: 'https://i.pravatar.cc/300?img=1',
      socialLinks: [
        { platform: 'twitter', url: 'https://twitter.com/mariedubois' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/mariedubois' },
      ],
      translations: { create: [
        { langCode: 'fr', bio: 'Journaliste passionnée par Annecy depuis 10 ans. Spécialiste de la culture et des événements locaux.', seoSlug: 'marie-dubois' },
        { langCode: 'en', bio: 'Journalist passionate about Annecy for 10 years. Specialist in culture and local events.', seoSlug: 'marie-dubois' },
        { langCode: 'es', bio: 'Periodista apasionada por Annecy desde hace 10 años. Especialista en cultura y eventos locales.', seoSlug: 'marie-dubois' },
        { langCode: 'de', bio: 'Journalistin, seit 10 Jahren begeistert von Annecy. Spezialistin für Kultur und lokale Veranstaltungen.', seoSlug: 'marie-dubois' },
        { langCode: 'zh', bio: '十年来热爱安纳西的记者。文化和本地活动专家。', seoSlug: 'marie-dubois' },
        { langCode: 'ar', bio: 'صحفية شغوفة بأنسي منذ 10 سنوات. متخصصة في الثقافة والفعاليات المحلية.', seoSlug: 'marie-dubois' },
      ] }
    }
  });
  const pierre = await prisma.author.create({
    data: {
      slug: 'pierre-martin',
      name: 'Pierre Martin',
      profileImageUrl: 'https://i.pravatar.cc/300?img=12',
      socialLinks: [
        { platform: 'twitter', url: 'https://twitter.com/pierremartin' },
        { platform: 'instagram', url: 'https://instagram.com/pierremartin' },
      ],
      translations: { create: [
        { langCode: 'fr', bio: 'Photographe et blogueur voyage. Explore les recoins cachés d\'Annecy et partage ses découvertes.', seoSlug: 'pierre-martin' },
        { langCode: 'en', bio: 'Photographer and travel blogger. Explores hidden corners of Annecy and shares discoveries.', seoSlug: 'pierre-martin' },
        { langCode: 'es', bio: 'Fotógrafo y bloguero de viajes. Explora los rincones ocultos de Annecy y comparte sus descubrimientos.', seoSlug: 'pierre-martin' },
        { langCode: 'de', bio: 'Fotograf und Reiseblogger. Erkundet versteckte Ecken von Annecy und teilt seine Entdeckungen.', seoSlug: 'pierre-martin' },
        { langCode: 'zh', bio: '摄影师和旅行博主。探索安纳西的隐秘角落并分享发现。', seoSlug: 'pierre-martin' },
        { langCode: 'ar', bio: 'مصور ومدون سفر. يستكشف زوايا أنسي المخفية ويشارك اكتشافاته.', seoSlug: 'pierre-martin' },
      ] }
    }
  });
  const sophie = await prisma.author.create({
    data: {
      slug: 'sophie-bernard',
      name: 'Sophie Bernard',
      profileImageUrl: 'https://i.pravatar.cc/300?img=5',
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/sophiebernard' },
      ],
      translations: { create: [
        { langCode: 'fr', bio: 'Experte en tourisme et hébergement. Conseille les visiteurs pour trouver le logement parfait.', seoSlug: 'sophie-bernard' },
        { langCode: 'en', bio: 'Tourism and accommodation expert. Helps visitors find the perfect place to stay.', seoSlug: 'sophie-bernard' },
        { langCode: 'es', bio: 'Experta en turismo y alojamiento. Ayuda a los visitantes a encontrar el lugar perfecto para quedarse.', seoSlug: 'sophie-bernard' },
        { langCode: 'de', bio: 'Expertin für Tourismus und Unterkunft. Hilft Besuchern, die perfekte Unterkunft zu finden.', seoSlug: 'sophie-bernard' },
        { langCode: 'zh', bio: '旅游和住宿专家。帮助游客找到理想的住宿。', seoSlug: 'sophie-bernard' },
        { langCode: 'ar', bio: 'خبيرة في السياحة والإقامة. تساعد الزوار في العثور على المكان المثالي للإقامة.', seoSlug: 'sophie-bernard' },
      ] }
    }
  });

  // =====================================================
  // ARTICLES
  // =====================================================
  console.log('📝 Seeding articles...');

  const article1 = await prisma.article.create({
    data: {
      categoryId: actualites.id,
      authorId: marie.id,
      featuredImageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
      publicationDate: new Date('2024-01-15'),
      readTimeMinutes: 5,
      viewCount: 1250,
      isFeatured: true,
      status: 'published',
      translations: { create: [
          { langCode: 'fr', name: 'Le Festival du Film d\'Animation revient en juin 2024', description: 'Le célèbre festival annécien annonce son programme pour l\'édition 2024 avec des avant-premières mondiales. Un rendez-vous pour les passionnés, les familles et les professionnels du secteur. Découvrez les coulisses, les ateliers, et les rencontres avec les réalisateurs.', content: '<h2>Un événement incontournable</h2><p>Le Festival International du Film d\'Animation d\'Annecy revient du 9 au 15 juin 2024 avec une programmation exceptionnelle. Plus de 500 films seront présentés, incluant des avant-premières mondiales et des rétrospectives de grands studios.</p><p>Cette année, le festival met l\'honneur sur l\'animation japonaise avec une sélection spéciale des œuvres du Studio Ghibli.</p><p>Des ateliers pour enfants, des masterclass, et des projections en plein air sont prévus tout au long de la semaine.</p>', featuredImageAlt: 'Festival du film d\'animation d\'Annecy', seoSlug: 'festival-film-animation-2024' },
          { langCode: 'en', name: 'Animation Film Festival Returns in June 2024', description: 'The famous Annecy festival announces its program for the 2024 edition with world premieres. A must-attend event for enthusiasts, families, and industry professionals. Discover behind-the-scenes, workshops, and meet directors.', content: '<h2>An Unmissable Event</h2><p>The Annecy International Animation Film Festival returns from June 9 to 15, 2024 with an exceptional program. Over 500 films will be presented, including world premieres and retrospectives from major studios.</p><p>This year, the festival honors Japanese animation with a special selection of works from Studio Ghibli.</p><p>Workshops for children, masterclasses, and outdoor screenings are scheduled throughout the week.</p>', featuredImageAlt: 'Annecy Animation Film Festival', seoSlug: 'animation-film-festival-2024' },
          { langCode: 'es', name: 'El Festival de Cine de Animación regresa en junio de 2024', description: 'El famoso festival de Annecy anuncia su programa para la edición 2024 con estrenos mundiales. Un evento imprescindible para aficionados, familias y profesionales. Descubre los entresijos, talleres y encuentros con directores.', content: '<h2>Un evento imperdible</h2><p>El Festival Internacional de Cine de Animación de Annecy regresa del 9 al 15 de junio de 2024 con una programación excepcional. Más de 500 películas serán presentadas, incluyendo estrenos mundiales y retrospectivas de grandes estudios.</p><p>Este año, el festival rinde homenaje a la animación japonesa con una selección especial de obras del Studio Ghibli.</p><p>Habrá talleres para niños, clases magistrales y proyecciones al aire libre durante toda la semana.</p>', featuredImageAlt: 'Festival de cine de animación de Annecy', seoSlug: 'festival-cine-animacion-2024' },
          { langCode: 'de', name: 'Das Animationsfilmfestival kehrt im Juni 2024 zurück', description: 'Das berühmte Festival von Annecy kündigt sein Programm für die Ausgabe 2024 mit Weltpremieren an. Ein Muss für Fans, Familien und Branchenprofis. Entdecken Sie die Hintergründe, Workshops und Treffen mit Regisseuren.', content: '<h2>Ein unverzichtbares Ereignis</h2><p>Das Internationale Animationsfilmfestival Annecy kehrt vom 9. bis 15. Juni 2024 mit einem außergewöhnlichen Programm zurück. Über 500 Filme werden gezeigt, darunter Weltpremieren und Retrospektiven großer Studios.</p><p>Dieses Jahr ehrt das Festival die japanische Animation mit einer speziellen Auswahl von Werken des Studio Ghibli.</p><p>Workshops für Kinder, Masterclasses und Open-Air-Vorführungen sind die ganze Woche über geplant.</p>', featuredImageAlt: 'Annecy Animationsfilmfestival', seoSlug: 'animationsfilmfestival-2024' },
          { langCode: 'zh', name: '动画电影节将于2024年6月回归', description: '著名的安纳西电影节公布了2024年世界首映的节目单。动画爱好者、家庭和行业专业人士不可错过的盛会。探索幕后、工作坊和与导演的见面会。', content: '<h2>不可错过的盛会</h2><p>安纳西国际动画电影节将于2024年6月9日至15日回归，带来精彩纷呈的节目。将展映500多部影片，包括世界首映和大型工作室的回顾展。</p><p>今年，电影节将特别致敬日本动画，精选吉卜力工作室的作品。</p><p>全周安排了儿童工作坊、大师班和户外放映。</p>', featuredImageAlt: '安纳西动画电影节', seoSlug: 'donghua-dianyingjie-2024' },
          { langCode: 'ar', name: 'مهرجان أفلام الرسوم المتحركة يعود في يونيو 2024', description: 'يعلن مهرجان أنسي الشهير عن برنامجه لعام 2024 مع عروض أولى عالمية. حدث لا يُفوت لعشاق الفن والعائلات والمحترفين. اكتشف الكواليس وورش العمل واللقاءات مع المخرجين.', content: '<h2>حدث لا يُفوت</h2><p>يعود مهرجان أنسي الدولي لأفلام الرسوم المتحركة من 9 إلى 15 يونيو 2024 ببرنامج استثنائي. سيتم عرض أكثر من 500 فيلم، بما في ذلك العروض الأولى العالمية واستعراضات لأكبر الاستوديوهات.</p><p>هذا العام، يكرم المهرجان الأنمي الياباني مع مجموعة خاصة من أعمال ستوديو جيبلي.</p><p>ورش عمل للأطفال، ودروس متقدمة، وعروض في الهواء الطلق طوال الأسبوع.</p>', featuredImageAlt: 'مهرجان أنسي للرسوم المتحركة', seoSlug: 'mahrjan-rasoom-june-2024' }
        ] }
    }
  });
  const article2 = await prisma.article.create({
    data: {
      categoryId: culture.id,
      authorId: pierre.id,
      featuredImageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
      publicationDate: new Date('2024-01-20'),
      readTimeMinutes: 8,
      viewCount: 890,
      isFeatured: true,
      status: 'published',
      translations: { create: [
        { langCode: 'fr', name: 'Découverte : 5 lieux secrets autour du lac d\'Annecy', description: 'Explorez les endroits méconnus qui font le charme du lac d\'Annecy, loin des sentiers battus. Ces lieux offrent des expériences uniques, des panoramas à couper le souffle et une tranquillité rare.', content: '<h2>Des trésors cachés</h2><p>Le lac d\'Annecy regorge de lieux magnifiques encore préservés du tourisme de masse. Nous avons sélectionné pour vous 5 spots secrets où profiter de la nature en toute tranquillité.</p><ul><li>La plage de la Brune à Veyrier-du-Lac</li><li>Le belvédère du col de la Forclaz</li><li>Les Jardins de l\'Europe au lever du soleil</li><li>La cascade d\'Angon</li><li>Le bout du lac à Doussard</li></ul><p>Chacun de ces endroits a son histoire et ses particularités. N\'hésitez pas à partir à leur découverte !</p>', featuredImageAlt: 'Lac d\'Annecy vue panoramique', seoSlug: 'lieux-secrets-lac-annecy' },
        { langCode: 'en', name: 'Discovery: 5 Secret Spots Around Lake Annecy', description: 'Explore the hidden gems that make Lake Annecy so charming, off the beaten path. These places offer unique experiences, breathtaking views, and rare tranquility.', content: '<h2>Hidden Treasures</h2><p>Lake Annecy is full of beautiful places still preserved from mass tourism. We have selected 5 secret spots for you to enjoy nature in peace.</p><ul><li>La Brune beach in Veyrier-du-Lac</li><li>Col de la Forclaz viewpoint</li><li>Jardins de l\'Europe at sunrise</li><li>Angon waterfall</li><li>End of the lake in Doussard</li></ul><p>Each spot has its own story and charm. Go explore them!</p>', featuredImageAlt: 'Lake Annecy panoramic view', seoSlug: 'secret-spots-lake-annecy' },
        { langCode: 'es', name: 'Descubrimiento: 5 lugares secretos alrededor del lago de Annecy', description: 'Explora los tesoros ocultos que hacen especial al lago de Annecy, lejos de las rutas turísticas. Lugares únicos con vistas impresionantes y tranquilidad.', content: '<h2>Tesoros escondidos</h2><p>El lago de Annecy está lleno de rincones hermosos aún preservados del turismo masivo. Hemos seleccionado 5 lugares secretos para que disfrutes de la naturaleza en paz.</p><ul><li>La playa de la Brune en Veyrier-du-Lac</li><li>El mirador del col de la Forclaz</li><li>Los Jardines de Europa al amanecer</li><li>La cascada de Angon</li><li>El extremo del lago en Doussard</li></ul><p>Cada sitio tiene su propia historia y encanto. ¡Atrévete a descubrirlos!</p>', featuredImageAlt: 'Vista panorámica del lago de Annecy', seoSlug: 'lugares-secretos-lago-annecy' },
        { langCode: 'de', name: 'Entdeckung: 5 geheime Orte rund um den See von Annecy', description: 'Entdecken Sie die verborgenen Schätze, die den See von Annecy so besonders machen, abseits der ausgetretenen Pfade. Einzigartige Orte mit atemberaubender Aussicht und Ruhe.', content: '<h2>Verborgene Schätze</h2><p>Der See von Annecy bietet viele wunderschöne Plätze, die noch vom Massentourismus verschont sind. Wir haben 5 geheime Orte für Sie ausgewählt, um die Natur in Ruhe zu genießen.</p><ul><li>Der Strand La Brune in Veyrier-du-Lac</li><li>Die Aussicht am Col de la Forclaz</li><li>Die Gärten Europas bei Sonnenaufgang</li><li>Der Wasserfall von Angon</li><li>Das Ende des Sees in Doussard</li></ul><p>Jeder Ort hat seine eigene Geschichte und seinen Charme. Entdecken Sie sie!</p>', featuredImageAlt: 'Panoramablick auf den See von Annecy', seoSlug: 'geheime-orte-see-annecy' },
        { langCode: 'zh', name: '发现：安纳西湖周边的5个秘密地点', description: '探索安纳西湖的隐藏宝藏，远离人群，享受独特体验和宁静。', content: '<h2>隐藏的宝藏</h2><p>安纳西湖有许多美丽的地方，尚未被大众旅游开发。我们为您精选了5个秘密地点，让您安静地享受大自然。</p><ul><li>Veyrier-du-Lac的La Brune海滩</li><li>Forclaz山口观景台</li><li>日出时的欧洲花园</li><li>Angon瀑布</li><li>Doussard的湖尾</li></ul><p>每个地方都有自己的故事和魅力。快去探索吧！</p>', featuredImageAlt: '安纳西湖全景', seoSlug: 'mimi-dian-annecy-hu' },
        { langCode: 'ar', name: 'اكتشاف: 5 أماكن سرية حول بحيرة أنسي', description: 'اكتشف الجواهر الخفية التي تجعل بحيرة أنسي ساحرة، بعيدًا عن المسارات المعتادة. أماكن فريدة بإطلالات خلابة وهدوء نادر.', content: '<h2>كنوز مخفية</h2><p>بحيرة أنسي مليئة بالأماكن الجميلة التي لا تزال بعيدة عن السياحة الجماعية. اخترنا لك 5 مواقع سرية للاستمتاع بالطبيعة بسلام.</p><ul><li>شاطئ لا برون في فييري-دو-لاك</li><li>منظر كول دو لا فوركلاز</li><li>حدائق أوروبا عند شروق الشمس</li><li>شلال أنغون</li><li>نهاية البحيرة في دوسار</li></ul><p>لكل مكان قصته وسحره الخاص. اكتشفها بنفسك!</p>', featuredImageAlt: 'منظر بانورامي لبحيرة أنسي', seoSlug: 'amakin-siriyya-anse-lake' },
      ] }
    }
  });
  const article3 = await prisma.article.create({
    data: {
      categoryId: bonPlans.id,
      authorId: sophie.id,
      featuredImageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      publicationDate: new Date('2024-02-01'),
      readTimeMinutes: 6,
      viewCount: 1580,
      isFeatured: false,
      status: 'published',
      translations: { create: [
        { langCode: 'fr', name: 'Où manger pour moins de 15€ à Annecy', description: 'Notre sélection des meilleurs restaurants abordables de la ville pour un repas savoureux sans se ruiner. Profitez d\'adresses variées, de plats locaux et d\'ambiances conviviales.', content: '<h2>Bien manger sans se ruiner</h2><p>Annecy n\'est pas qu\'une ville pour les budgets élevés ! Découvrez nos adresses préférées pour un déjeuner ou dîner délicieux à petit prix.</p><h3>Nos coups de cœur :</h3><ul><li><strong>Le Bouillon</strong> - Cuisine française traditionnelle, menu à 12€</li><li><strong>Chez Mamie</strong> - Plats du jour savoyards, 14€</li><li><strong>La Petite Cuisine</strong> - Formule midi à 13€</li></ul><p>Certains restaurants proposent aussi des options végétariennes et des menus enfants.</p>', featuredImageAlt: 'Restaurant à Annecy', seoSlug: 'manger-pas-cher-annecy' },
        { langCode: 'en', name: 'Where to Eat for Less Than 15€ in Annecy', description: 'Our selection of the best affordable restaurants in the city for a delicious meal without breaking the bank. Enjoy a variety of places, local dishes, and friendly atmospheres.', content: '<h2>Eat Well Without Breaking the Bank</h2><p>Annecy is not just a city for high budgets! Discover our favorite addresses for a delicious lunch or dinner at a low price.</p><h3>Our Favorites:</h3><ul><li><strong>Le Bouillon</strong> - Traditional French cuisine, 12€ menu</li><li><strong>Chez Mamie</strong> - Savoyard daily specials, 14€</li><li><strong>La Petite Cuisine</strong> - Lunch special at 13€</li></ul><p>Some restaurants also offer vegetarian options and kids menus.</p>', featuredImageAlt: 'Restaurant in Annecy', seoSlug: 'eat-cheap-annecy' },
        { langCode: 'es', name: 'Dónde comer por menos de 15€ en Annecy', description: 'Nuestra selección de los mejores restaurantes asequibles de la ciudad para una comida deliciosa sin gastar mucho. Lugares variados y platos locales.', content: '<h2>Comer bien sin gastar mucho</h2><p>¡Annecy no es solo para grandes presupuestos! Descubre nuestras direcciones favoritas para almorzar o cenar rico y barato.</p><h3>Nuestros favoritos:</h3><ul><li><strong>Le Bouillon</strong> - Cocina francesa tradicional, menú a 12€</li><li><strong>Chez Mamie</strong> - Platos del día saboyanos, 14€</li><li><strong>La Petite Cuisine</strong> - Menú de mediodía a 13€</li></ul><p>Algunos restaurantes ofrecen opciones vegetarianas y menús infantiles.</p>', featuredImageAlt: 'Restaurante en Annecy', seoSlug: 'comer-barato-annecy' },
        { langCode: 'de', name: 'Wo man in Annecy für weniger als 15€ essen kann', description: 'Unsere Auswahl der besten günstigen Restaurants der Stadt für ein leckeres Essen zum kleinen Preis. Verschiedene Lokale und regionale Gerichte.', content: '<h2>Gut essen für wenig Geld</h2><p>Annecy ist nicht nur für große Budgets! Entdecken Sie unsere Lieblingsadressen für ein leckeres Mittag- oder Abendessen zum kleinen Preis.</p><h3>Unsere Favoriten:</h3><ul><li><strong>Le Bouillon</strong> - Traditionelle französische Küche, Menü für 12€</li><li><strong>Chez Mamie</strong> - Savoyer Tagesgerichte, 14€</li><li><strong>La Petite Cuisine</strong> - Mittagsmenü für 13€</li></ul><p>Viele Restaurants bieten auch vegetarische Optionen und Kindermenüs an.</p>', featuredImageAlt: 'Restaurant in Annecy', seoSlug: 'guenstig-essen-annecy' },
        { langCode: 'zh', name: '在安纳西15欧元以下的美食推荐', description: '我们为您精选了安纳西最实惠的餐厅，让您享受美味又不破费。多样选择，地方特色。', content: '<h2>实惠美食</h2><p>安纳西不仅适合高预算！发现我们最喜欢的实惠午餐和晚餐地址。</p><h3>推荐餐厅：</h3><ul><li><strong>Le Bouillon</strong> - 法式传统料理，12欧菜单</li><li><strong>Chez Mamie</strong> - 萨瓦特色每日菜肴，14欧</li><li><strong>La Petite Cuisine</strong> - 午餐套餐13欧</li></ul><p>部分餐厅还提供素食和儿童菜单。</p>', featuredImageAlt: '安纳西餐厅', seoSlug: 'shihui-meishi-annecy' },
        { langCode: 'ar', name: 'أين تأكل بأقل من 15€ في أنسي', description: 'اختيارنا لأفضل المطاعم الاقتصادية في المدينة لوجبة لذيذة دون إنفاق الكثير. أماكن متنوعة وأطباق محلية.', content: '<h2>تناول طعامًا جيدًا بسعر منخفض</h2><p>أنسي ليست فقط للميزانيات الكبيرة! اكتشف عناويننا المفضلة للغداء أو العشاء اللذيذ بسعر منخفض.</p><h3>المفضلة لدينا:</h3><ul><li><strong>Le Bouillon</strong> - مطبخ فرنسي تقليدي، قائمة 12€</li><li><strong>Chez Mamie</strong> - أطباق سافوي اليومية، 14€</li><li><strong>La Petite Cuisine</strong> - قائمة غداء 13€</li></ul><p>بعض المطاعم تقدم أيضًا خيارات نباتية وقوائم للأطفال.</p>', featuredImageAlt: 'مطعم في أنسي', seoSlug: 'taam-rakhis-annecy' },
      ] }
    }
  });
  const article4 = await prisma.article.create({
    data: {
      categoryId: actualites.id,
      authorId: marie.id,
      featuredImageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      publicationDate: new Date('2024-02-10'),
      readTimeMinutes: 4,
      viewCount: 520,
      isFeatured: false,
      status: 'published',
      translations: { create: [
        { langCode: 'fr', name: 'Nouvelle piste cyclable inaugurée autour du lac', description: 'Une piste cyclable de 10 km vient d\'être inaugurée, facilitant le tour du lac à vélo. Un projet attendu par les habitants et les touristes.', content: '<h2>Mobilité douce</h2><p>La ville d\'Annecy poursuit ses efforts en faveur de la mobilité douce avec l\'inauguration d\'une nouvelle piste cyclable de 10 km reliant Annecy à Sévrier.</p><p>Cette infrastructure permet désormais de faire le tour complet du lac en vélo en toute sécurité. Des aires de repos et des points de location de vélos sont également disponibles.</p>', featuredImageAlt: 'Piste cyclable lac d\'Annecy', seoSlug: 'nouvelle-piste-cyclable-lac' },
        { langCode: 'en', name: 'New Bike Path Opened Around the Lake', description: 'A 10 km bike path has just been opened, making it easier to cycle around the lake. A project welcomed by locals and tourists.', content: '<h2>Soft Mobility</h2><p>The city of Annecy continues its efforts for soft mobility with the opening of a new 10 km bike path connecting Annecy to Sévrier.</p><p>This infrastructure now allows a complete tour of the lake by bike in total safety. Rest areas and bike rental points are also available.</p>', featuredImageAlt: 'Annecy lake bike path', seoSlug: 'new-bike-path-lake' },
        { langCode: 'es', name: 'Nueva ruta ciclista inaugurada alrededor del lago', description: 'Se acaba de inaugurar una ruta ciclista de 10 km, facilitando el recorrido en bicicleta por el lago. Proyecto esperado por residentes y turistas.', content: '<h2>Movilidad sostenible</h2><p>La ciudad de Annecy sigue apostando por la movilidad sostenible con la inauguración de una nueva ruta ciclista de 10 km que conecta Annecy con Sévrier.</p><p>Esta infraestructura permite ahora recorrer todo el lago en bicicleta con total seguridad. Hay áreas de descanso y puntos de alquiler de bicicletas disponibles.</p>', featuredImageAlt: 'Ruta ciclista lago Annecy', seoSlug: 'nueva-ruta-ciclista-lago' },
        { langCode: 'de', name: 'Neue Radstrecke um den See eröffnet', description: 'Eine 10 km lange Radstrecke wurde eröffnet und erleichtert die Umrundung des Sees mit dem Fahrrad. Ein Projekt, das von Einheimischen und Touristen begrüßt wird.', content: '<h2>Sanfte Mobilität</h2><p>Die Stadt Annecy setzt ihre Bemühungen für sanfte Mobilität fort und eröffnet eine neue 10 km lange Radstrecke, die Annecy mit Sévrier verbindet.</p><p>Diese Infrastruktur ermöglicht nun eine komplette Umrundung des Sees mit dem Fahrrad in völliger Sicherheit. Es gibt auch Rastplätze und Fahrradverleihstationen.</p>', featuredImageAlt: 'Radweg am See von Annecy', seoSlug: 'neue-radstrecke-see' },
        { langCode: 'zh', name: '环湖新自行车道开通', description: '一条长达10公里的自行车道刚刚开通，方便环湖骑行。居民和游客都非常期待的项目。', content: '<h2>绿色出行</h2><p>安纳西市持续推进绿色出行，开通了一条连接安纳西和塞弗里耶的新10公里自行车道。</p><p>现在可以安全地环湖骑行。沿途设有休息区和自行车租赁点。</p>', featuredImageAlt: '安纳西湖自行车道', seoSlug: 'huanhu-zixingchedao' },
        { langCode: 'ar', name: 'افتتاح مسار دراجات جديد حول البحيرة', description: 'تم افتتاح مسار دراجات بطول 10 كم، مما يسهل التجول حول البحيرة بالدراجة. مشروع طال انتظاره من السكان والسياح.', content: '<h2>تنقل مستدام</h2><p>تواصل مدينة أنسي جهودها في التنقل المستدام بافتتاح مسار دراجات جديد بطول 10 كم يربط أنسي بسيفرييه.</p><p>تسمح هذه البنية التحتية الآن بجولة كاملة حول البحيرة بالدراجة بأمان تام. تتوفر أيضًا مناطق للراحة ونقاط لتأجير الدراجات.</p>', featuredImageAlt: 'مسار دراجات بحيرة أنسي', seoSlug: 'masar-darajat-buhayra' },
      ] }
    }
  });

  // =====================================================
  // COMMENTS
  // =====================================================
  console.log('💬 Seeding comments...');

  const comment1 = await prisma.comment.create({
    data: {
      articleId: article1.id,
      authorName: 'Jean Dupont',
      authorEmail: 'jean.dupont@example.com',
      content: 'Très intéressant ! J\'ai hâte de découvrir cette édition du festival.',
      status: 'approved',
    }
  });
  await prisma.comment.create({
    data: {
      articleId: article1.id,
      parentCommentId: comment1.id,
      authorName: 'Marie Dubois',
      authorEmail: 'marie.dubois@example.com',
      content: 'Merci Jean ! Le programme sera exceptionnel cette année.',
      status: 'approved',
    }
  });
  await prisma.comment.create({
    data: {
      articleId: article2.id,
      authorName: 'Sophie Laurent',
      authorEmail: 'sophie.laurent@example.com',
      content: 'Merci pour ces bonnes adresses ! La cascade d\'Angon est magnifique.',
      status: 'approved',
    }
  });
  await prisma.comment.create({
    data: {
      articleId: article3.id,
      authorName: 'Thomas Bernard',
      authorEmail: 'thomas.bernard@example.com',
      content: 'Le Bouillon est excellent, je recommande vivement !',
      status: 'approved',
    }
  });

  // =====================================================
  // PLACES (Hébergements)
  // =====================================================
  console.log('🏨 Seeding places...');

  const place1 = await prisma.place.create({
    data: {
      categoryId: hotels.id,
      mainImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      isFeatured: true,
      status: 'published',
      translations: { create: [
        { langCode: 'fr', name: 'Hôtel Lac & Spa', description: 'Hôtel 4 étoiles avec vue panoramique sur le lac d\'Annecy. Spa, piscine chauffée et restaurant gastronomique.', seoSlug: 'hotel-lac-spa' },
        { langCode: 'en', name: 'Lake & Spa Hotel', description: '4-star hotel with panoramic views of Lake Annecy. Spa, heated pool and gourmet restaurant.', seoSlug: 'lake-spa-hotel' },
        { langCode: 'es', name: 'Hotel Lago & Spa', description: 'Hotel de 4 estrellas con vistas panorámicas al lago de Annecy. Spa, piscina climatizada y restaurante gourmet.', seoSlug: 'hotel-lago-spa' },
        { langCode: 'de', name: 'See & Spa Hotel', description: '4-Sterne-Hotel mit Panoramablick auf den See von Annecy. Spa, beheizter Pool und Gourmetrestaurant.', seoSlug: 'see-spa-hotel' },
        { langCode: 'zh', name: '湖景水疗酒店', description: '四星级酒店，享有安纳西湖全景。水疗中心、加热泳池和美食餐厅。', seoSlug: 'hujing-shuiliao-jiudian' },
        { langCode: 'ar', name: 'فندق البحيرة والسبا', description: 'فندق 4 نجوم مع إطلالة بانورامية على بحيرة أنسي. سبا، مسبح مدفأ ومطعم فاخر.', seoSlug: 'funduq-buhayra-spa' },
      ] },
      details: { create: { pricePerNight: 180, capacity: 2, amenities: ['wifi', 'parking', 'spa', 'piscine', 'restaurant', 'climatisation', 'vue_lac'] } }
    }
  });
  const place2 = await prisma.place.create({
    data: {
      categoryId: hotels.id,
      mainImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      isFeatured: false,
      status: 'published',
      translations: { create: [
        { langCode: 'fr', name: 'Hôtel du Centre', description: 'Hôtel confortable en plein cœur de la vieille ville. Idéal pour découvrir Annecy à pied.', seoSlug: 'hotel-du-centre' },
        { langCode: 'en', name: 'Downtown Hotel', description: 'Comfortable hotel in the heart of the old town. Perfect for exploring Annecy on foot.', seoSlug: 'downtown-hotel' },
        { langCode: 'es', name: 'Hotel Centro', description: 'Hotel cómodo en el corazón del casco antiguo. Perfecto para explorar Annecy a pie.', seoSlug: 'hotel-centro' },
        { langCode: 'de', name: 'Stadthotel', description: 'Komfortables Hotel im Herzen der Altstadt. Ideal, um Annecy zu Fuß zu erkunden.', seoSlug: 'stadthotel' },
        { langCode: 'zh', name: '市中心酒店', description: '舒适的酒店，位于老城区中心。步行探索安纳西的理想选择。', seoSlug: 'shizhongxin-jiudian' },
        { langCode: 'ar', name: 'فندق وسط المدينة', description: 'فندق مريح في قلب المدينة القديمة. مثالي لاستكشاف أنسي سيرًا على الأقدام.', seoSlug: 'funduq-wasat-madina' },
      ] },
      details: { create: { pricePerNight: 95, capacity: 2, amenities: ['wifi', 'petit_dejeuner', 'centre_ville'] } }
    }
  });
  const place3 = await prisma.place.create({
    data: {
      categoryId: chambresHotes.id,
      mainImageUrl: 'https://images.unsplash.com/photo-1587985064135-0366536eac41?w=800',
      isFeatured: true,
      status: 'published',
      translations: { create: [
        { langCode: 'fr', name: 'La Maison des Alpes', description: 'Chambre d\'hôtes chaleureuse dans un chalet savoyard authentique. Petit-déjeuner fait maison inclus.', seoSlug: 'maison-des-alpes' },
        { langCode: 'en', name: 'Alpine House', description: 'Cozy bed & breakfast in an authentic Savoyard chalet. Homemade breakfast included.', seoSlug: 'alpine-house' },
        { langCode: 'es', name: 'Casa Alpina', description: 'Acogedora casa de huéspedes en un auténtico chalet saboyano. Desayuno casero incluido.', seoSlug: 'casa-alpina' },
        { langCode: 'de', name: 'Alpenhaus', description: 'Gemütliches Bed & Breakfast in einem authentischen Savoyer Chalet. Hausgemachtes Frühstück inklusive.', seoSlug: 'alpenhaus' },
        { langCode: 'zh', name: '阿尔卑斯之家', description: '温馨的民宿，位于正宗萨瓦风格的小屋。含自制早餐。', seoSlug: 'aerbeisi-zhijia' },
        { langCode: 'ar', name: 'بيت الألب', description: 'غرفة ضيافة دافئة في شاليه سافويارد أصيل. إفطار منزلي مشمول.', seoSlug: 'bayt-al-alb' },
      ] },
      details: { create: { pricePerNight: 120, capacity: 4, amenities: ['wifi', 'parking', 'petit_dejeuner', 'jardin', 'vue_montagne', 'cheminee'] } }
    }
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('   - 7 categories created');
  console.log('   - 3 authors created');
  console.log('   - 4 articles created');
  console.log('   - 4 comments created');
  console.log('   - 3 places created');
  console.log('   - All with multilingual translations (fr, en, es where applicable)');
}

main()
  .then(() => {
    console.log('🎉 Seeding process finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });


export type Language = 'es' | 'en' | 'pt';

export const translations = {
    es: {
        nav: {
            home: 'Inicio',
            rooms: 'Habitaciones',
            location: 'Ubicación',
            contact: 'Contacto',
            admin: 'Admin'
        },
        common: {
            back: 'Volver',
            back_home: 'Volver al inicio',
            back_list: 'Volver a la lista',
            view_rooms: 'Ver Habitaciones',
            residence: 'Residencia',
            sede: 'Sede',
            rooms_in: 'Habitaciones en',
            loading: 'Cargando...',
            not_found: 'No encontrado.',
            consult_availability: 'Consultar disponibilidad mediante'
        },
        hero: {
            subtitle: 'Residencia Universitaria',
            title: 'Residencias Éclat',
            description: 'Seguridad, Orden y Comunidad.\nHabitaciones diseñadas para estudiantes y profesionales en la ciudad.',
            cta_residences: 'Nuestras Residencias'
        },
        features: {
            safe: {
                title: 'Seguro',
                desc: 'Protocolos de acceso y vigilancia 24/7.'
            },
            flexible: {
                title: 'Flexible',
                desc: 'Gestión de reservas 100% online y automatizada.'
            },
            central: {
                title: 'Céntrico',
                desc: 'Ubicación estratégica cerca de todo.'
            }
        },
        location: {
            subtitle: 'Dónde estamos',
            title: 'Ubicación Estratégica',
            description: 'Situada en una zona clave de la ciudad, Residencia Éclat ofrece acceso inmediato a las principales universidades, centros gastronómicos y puntos de interés.',
            address_title: 'Dirección Central',
            address: 'Olivera 1208 / 1212, Parque Patricios, Buenos Aires',
            access_title: 'Accesibilidad',
            access_desc: 'A 5 minutos de estaciones de metro y corredores principales.',
            map_cta: 'Ver en Google Maps'
        },
        convenios: {
            subtitle: 'Convenios y Beneficios',
            title: 'Convenios que potencian tu estadía',
            description: 'En Éclat, no solo ofrecemos un lugar de calidad, sino un ecosistema de beneficios. Hemos forjado alianzas con diversas instituciones para garantizarte condiciones preferenciales, descuentos y una comunidad activa.',
            items: {
                uni: 'Universidades',
                corp: 'Corporativos',
                emb: 'Gimnasios',
                cowork: 'Coworkings'
            }
        },
        contact: {
            subtitle: 'Contacto',
            title: 'Hablemos de tu estadía',
            description: 'En Éclat nos comprometemos a ofrecerle a nuestros residentes un espacio seguro, organizado y pensado para que vivas tu mejor etapa en Buenos Aires. Nuestro equipo está disponible para responder todas tus preguntas sobre habitaciones y servicios.',
            labels: {
                name: 'Nombre',
                email: 'Email',
                phone: 'Teléfono',
                message: 'Mensaje',
                submit: 'Enviar Mensaje'
            }
        },
        residences: {
            A: {
                title: 'Sede San Telmo',
                description: 'Ubicado en el Barrio de San Telmo, tenes cercanía con varios institutos, universidades y acceso al subte.',
                comfort: 'Espacios pensados para el descanso y el estudio. Cocina equipada, WiFi de alta velocidad, limpieza semanal y áreas comunes cómodas para que te sientas en casa.'
            },
            B: {
                title: 'Sede Parque Patricios I (Olivera 1208)',
                description: 'Ambientes modernos y luminosos con todas las comodidades para una estadía perfecta en Buenos Aires, cerca del Parque Patricios.',
                comfort: 'Habitaciones amplias con luz natural, cocina equipada, WiFi de alta velocidad, limpieza semanal y zonas comunes diseñadas para el estudio y la convivencia.'
            },
            C: {
                title: 'Sede Parque Patricios II (Olivera 1212)',
                description: 'Habitaciones premium con vistas privilegiadas y acceso a servicios exclusivos para una experiencia única en Buenos Aires.',
                comfort: 'Ambientes premium con acabados de calidad, cocina totalmente equipada, WiFi de alta velocidad, limpieza semanal y espacios comunes diseñados para el bienestar.'
            }
        },
        footer: {
            desc: 'Sistema de gestión inteligente para residencias modernas.',
            rights: '© 2026 Residencia Éclat. Todos los derechos reservados.'
        },
        room: {
            status: {
                available: 'Disponible',
                partial_1: '1 Cama Disponible',
                partial_2: '2 Camas Disponibles',
                partial_3: '3 Camas Disponibles',
                occupied: 'Ocupada',
                reserved: 'Reservada',
                maintenance: 'En Mantenimiento'
            },
            room_names: {
                'Habitacion Individual': 'Habitación Individual',
                'Habitacion Indvidual': 'Habitación Individual',
                'Habitacion Doble': 'Habitación Doble',
                'Habitacion Cuadruple': 'Habitación Cuádruple',
                'Habitación Clásica': 'Habitación Clásica'
            },
            consult_next: 'Consultar próxima fecha libre',
            out_of_service: 'Habitación fuera de servicio',
            inquiry_subject: 'Consulta sobre',
            wa_message: 'Hola! Quiero consultar sobre la habitación'
        }
    },
    en: {
        nav: {
            home: 'Home',
            rooms: 'Rooms',
            location: 'Location',
            contact: 'Contact',
            admin: 'Admin'
        },
        common: {
            back: 'Back',
            back_home: 'Back to home',
            back_list: 'Back to list',
            view_rooms: 'View Rooms',
            residence: 'Residence',
            sede: 'Branch',
            rooms_in: 'Rooms in',
            loading: 'Loading...',
            not_found: 'Not found.',
            consult_availability: 'Check availability via'
        },
        hero: {
            subtitle: 'University Residence',
            title: 'Éclat Residences',
            description: 'Security, Order and Community.\nRooms designed for students and professionals in the city.',
            cta_residences: 'Our Residences'
        },
        features: {
            safe: {
                title: 'Secure',
                desc: '24/7 access protocols and surveillance.'
            },
            flexible: {
                title: 'Flexible',
                desc: '100% online and automated reservation management.'
            },
            central: {
                title: 'Central',
                desc: 'Strategic location close to everything.'
            }
        },
        location: {
            subtitle: 'Where we are',
            title: 'Strategic Location',
            description: 'Located in a key area of the city, Éclat Residence offers immediate access to major universities, dining hubs, and points of interest.',
            address_title: 'Central Address',
            address: 'Olivera 1208 / 1212, Parque Patricios, Buenos Aires',
            access_title: 'Accessibility',
            access_desc: '5 minutes from subway stations and major corridors.',
            map_cta: 'View on Google Maps'
        },
        convenios: {
            subtitle: 'Agreements & Benefits',
            title: 'Agreements that enhance your stay',
            description: 'At Éclat Residence, we don\'t just offer a quality place, but an ecosystem of benefits. We have forged alliances with various institutions to guarantee you preferential conditions, discounts, and an active community.',
            items: {
                uni: 'Universities',
                corp: 'Corporate',
                emb: 'Gyms',
                cowork: 'Coworking'
            }
        },
        contact: {
            subtitle: 'Contact',
            title: 'Let\'s talk about your stay',
            description: 'At Éclat, we are committed to offering our residents a safe, organized space designed for you to live your best stage in Buenos Aires. Our team is available to answer all your questions about rooms and services.',
            labels: {
                name: 'Name',
                email: 'Email',
                phone: 'Phone',
                message: 'Message',
                submit: 'Send Message'
            }
        },
        residences: {
            A: {
                title: 'San Telmo Branch',
                description: 'Located in the San Telmo neighborhood, you are close to several institutes, universities and subway access.',
                comfort: 'Spaces designed for rest and study. Equipped kitchen, high-speed WiFi, weekly cleaning, and comfortable common areas to make you feel at home.'
            },
            B: {
                title: 'Parque Patricios I Branch (Olivera 1208)',
                description: 'Modern and bright environments with all the amenities for a perfect stay in Buenos Aires, near Parque Patricios.',
                comfort: 'Spacious rooms with natural light, equipped kitchen, high-speed WiFi, weekly cleaning, and common areas designed for study and coexistence.'
            },
            C: {
                title: 'Parque Patricios II Branch (Olivera 1212)',
                description: 'Premium rooms with privileged views and access to exclusive services for a unique experience in Buenos Aires.',
                comfort: 'Premium environments with quality finishes, fully equipped kitchen, high-speed WiFi, weekly cleaning, and common spaces designed for well-being.'
            }
        },
        footer: {
            desc: 'Smart management system for modern residences.',
            rights: '© 2026 Residencia Éclat. All rights reserved.'
        },
        room: {
            status: {
                available: 'Available',
                partial_1: '1 Bed Available',
                partial_2: '2 Beds Available',
                partial_3: '3 Beds Available',
                occupied: 'Occupied',
                reserved: 'Reserved',
                maintenance: 'Under Maintenance'
            },
            room_names: {
                'Habitacion Individual': 'Individual Room',
                'Habitacion Indvidual': 'Individual Room',
                'Habitacion Doble': 'Double Room',
                'Habitacion Cuadruple': 'Quadruple Room',
                'Habitación Clásica': 'Classic Room'
            },
            consult_next: 'Check next available date',
            out_of_service: 'Room out of service',
            inquiry_subject: 'Inquiry about',
            wa_message: 'Hello! I want to inquire about the room'
        }
    },
    pt: {
        nav: {
            home: 'Início',
            rooms: 'Quartos',
            location: 'Localização',
            contact: 'Contato',
            admin: 'Admin'
        },
        common: {
            back: 'Voltar',
            back_home: 'Voltar ao início',
            back_list: 'Voltar à lista',
            view_rooms: 'Ver Quartos',
            residence: 'Residência',
            sede: 'Sede',
            rooms_in: 'Quartos em',
            loading: 'Carregando...',
            not_found: 'Não encontrado.',
            consult_availability: 'Consultar disponibilidade mediante'
        },
        hero: {
            subtitle: 'Residência Universitária',
            title: 'Residências Éclat',
            description: 'Segurança, Ordem e Comunidade.\nQuartos projetados para estudantes e profissionais na cidade.',
            cta_residences: 'Nossas Residências'
        },
        features: {
            safe: {
                title: 'Seguro',
                desc: 'Protocolos de acesso e vigilância 24 horas por dia.'
            },
            flexible: {
                title: 'Flexível',
                desc: 'Gestão de reservas 100% online e automatizada.'
            },
            central: {
                title: 'Central',
                desc: 'Localização estratégica perto de tudo.'
            }
        },
        location: {
            subtitle: 'Onde estamos',
            title: 'Localização Estratégica',
            description: 'Situada em uma área chave da cidade, a Residência Éclat oferece acesso imediato às principais universidades, centros gastronômicos e pontos de interesse.',
            address_title: 'Endereço Central',
            address: 'Olivera 1208 / 1212, Parque Patricios, Buenos Aires',
            access_title: 'Acessibilidade',
            access_desc: 'A 5 minutos de estações de metrô e corredores principais.',
            map_cta: 'Ver no Google Maps'
        },
        convenios: {
            subtitle: 'Convênios e Benefícios',
            title: 'Convênios que potenciam sua estadia',
            description: 'Na Éclat, não oferecemos apenas um lugar de qualidade, mas um ecossistema de benefícios. Estabelecemos alianças com diversas instituições para garantir a você condições preferenciais, descontos e una comunidade ativa.',
            items: {
                uni: 'Universidades',
                corp: 'Corporativos',
                emb: 'Academias',
                cowork: 'Coworkings'
            }
        },
        contact: {
            subtitle: 'Contato',
            title: 'Vamos conversar sobre sua estadia',
            description: 'Na Éclat, nos comprometemos a oferecer aos nossos residentes um espaço seguro, organizado e pensado para que você viva sua melhor etapa em Buenos Aires. Nossa equipe está disponível para responder a todas as suas perguntas sobre quartos e serviços.',
            labels: {
                name: 'Nome',
                email: 'E-mail',
                phone: 'Telefone',
                message: 'Mensagem',
                submit: 'Enviar Mensagem'
            }
        },
        residences: {
            A: {
                title: 'Sede San Telmo',
                description: 'Localizado no Bairro de San Telmo, você tem proximidade com vários institutos, universidades e acesso ao metrô.',
                comfort: 'Espaços pensados para o descanso e o estudo. Cozinha equipada, WiFi de alta velocidade, limpeza semanal e áreas comuns confortáveis para que você se sinta em casa.'
            },
            B: {
                title: 'Sede Parque Patricios I (Olivera 1208)',
                description: 'Ambientes modernos e luminosos com todas las comodidades para uma estadia perfeita em Buenos Aires, perto do Parque Patricios.',
                comfort: 'Quartos amplos com luz natural, cozinha equipada, WiFi de alta velocidade, limpeza semanal e zonas comuns projetadas para o estudo e a convivência.'
            },
            C: {
                title: 'Sede Parque Patricios II (Olivera 1212)',
                description: 'Quartos premium com vistas privilegiadas e acesso a servicios exclusivos para uma experiência única em Buenos Aires.',
                comfort: 'Ambientes premium com acabamentos de qualidade, cozinha totalmente equipada, WiFi de alta velocidade, limpeza semanal e espaços comuns projetados para o bem-estar.'
            }
        },
        footer: {
            desc: 'Sistema de gestão inteligente para residências modernas.',
            rights: '© 2026 Residencia Éclat. Todos os direitos reservados.'
        },
        room: {
            status: {
                available: 'Disponível',
                partial_1: '1 Cama Disponível',
                partial_2: '2 Camas Disponíveis',
                partial_3: '3 Camas Disponíveis',
                occupied: 'Ocupado',
                reserved: 'Reservado',
                maintenance: 'Em Manutenção'
            },
            room_names: {
                'Habitacion Individual': 'Quarto Individual',
                'Habitacion Indvidual': 'Quarto Individual',
                'Habitacion Doble': 'Quarto Duplo',
                'Habitacion Cuadruple': 'Quarto Quádruplo',
                'Habitación Clásica': 'Quarto Clássico'
            },
            consult_next: 'Consultar próxima data disponível',
            out_of_service: 'Quarto fora de serviço',
            inquiry_subject: 'Consulta sobre',
            wa_message: 'Olá! Quero consultar sobre o quarto'
        }
    }
};

# README - Liquid Glass Music Player

##  SOBRE:

A ideia principal é ser um player web que combina a pegada do Winamp com design contemporâneo Liquid Glass,sendo uma experiência visual com elementos bonitos e animações fluidas.


## O que eu Destaco

- **Design Liquid Glass**: Efeito glassmorphism aprimorado com animações fluidas e transições suaves
- **Capes Personalizadas**: Design exclusivo de CDs criado no Canva por mim para cada álbum
- **Background Dinâmico**: Fundo que se transforma conforme a música por meio de JavaScript, criando imersão
- **Playlist Interativa**: Navegação intuitiva com feedback visual 
- **Controles Unificados**: Play/pause em um único botão e volume compartilhado entre as fontes
- **Estado Persistente**: O navegador lembra faixa, posição, volume e modo de busca

##  Acervo 

O player vem com um acervo de 20 músicas:

1. **Australian Crawl** - No Not You Again (1981)
2. **Black Eyed Peas** - Meet Me Halfway (2009) 
3. **Bob Marley** - Could You Be Loved (1980)
4. **MF DOOM feat. Mr. Fantastik** - Rapp Snitch Knishes (2004)
5. **Daft Punk** - Get Lucky (2014)
6. **Zé Ramalho** - Chão de Giz (1977)
7. **The Cranberries** - Linger (1993)
8. **No Doubt** - Just a Girl (1995)
9. **Sade** - Kiss of Life (1988)
10. **MGMT** - Kids (2005)
11. **Cidade Negra** - Luta De Classes (1994)
12. **Ziggy Marley and the Melody Makers** - Tomorrow People (1988)
13. **Joy Division** - Disorder (1979)
14. **Bread** - Everything I Own (1972)
15. **Chico Science** - Da Lama ao Caos (1994)
16. **Ween** - Ocean Man (1997)
17. **Sublime** - Santeria (1996)
18. **Simple Minds** - Mandela Day (1989)
19. **David Bowie** - Starman (1973)
20. **Engenheiros de Hawaii** - Infinita Highway (1987)

-- todas armazenadas localmente



**Link Oficial:** [https://murilomfv.github.io/music-player/](https://murilomfv.github.io/music-player/)

## Integração com Spotify

O player usa Authorization Code com PKCE e o Spotify Web Playback SDK. A busca e a reprodução local continuam independentes, mas somente uma fonte de áudio fica ativa por vez. Para tocar faixas completas dentro do navegador é necessário usar uma conta Spotify Premium.

Antes de publicar ou testar, abra o app correspondente no [Spotify for Developers](https://developer.spotify.com/dashboard) e cadastre exatamente as URLs utilizadas em **Redirect URIs**:

- Produção: `https://murilomfv.github.io/music-player/`
- Desenvolvimento: `http://127.0.0.1:8000/`

Para iniciar o projeto localmente:

```bash
python3 -m http.server 8000
```

Depois acesse `http://127.0.0.1:8000/`. Abrir o `index.html` diretamente como arquivo não funciona com a autenticação PKCE. O navegador recebe apenas o Client ID público; não coloque um Client Secret em `spotify.js`.

Se uma conta não Premium tentar reproduzir, o app informa a limitação e mantém o link **Abrir** para continuar no aplicativo/site do Spotify.

## Detalhes do Design:

### Capas Customizadas
Todas as capas de álbum foram meticulosamente criadas no Canva, acho que a capa sendo uma simulação de um cd lacrado traz mais identidade e faz com que o usuário tenha identificação visual

### Evolução do Conceito
- **Ideia Original**: Player estilo Winamp clássico
- **Conceito Final**: Fusão entre Winamp e design liquid glass moderno da Apple
- **Elementos Preservados**: Animações características e pegada visual dos players antigos


##  Próximas Atualizações

- [ ] **Sistema de Biblioteca com Back-end**
- [ ] **Upload de arquivos MP3 pessoais**
- [ ] **Mais animações retrô personalizáveis**
- [ ] **Temas visuais alternativos**
- [ ] **Sistema de playlists customizáveis**
- [ ] **Controle de Volume**

## Tecnologias Utilizadas

- **HTML5** + **CSS3** com efeitos Glassmorphism
- **JavaScript** para lógica e funções 
- **HTMLMediaElement** e **Spotify Web Playback SDK** para controle de áudio
- **Animações CSS** com keyframes fluidas
- **Design Responsivo** para todos os dispositivos

##  Estrutura do Projeto

```
music-player/
│
├── index.html          # Estrutura principal
├── styles.css          # Estilos Liquid Glass
├── library.js          # Catálogo e metadados das faixas locais
├── script.js           # Controlador do player local e estado compartilhado
├── spotify.js          # Autenticação, busca e reprodução do Spotify
├── tracks/             # Arquivos de áudio
├── covers/             # Capas customizadas (Canva)
└── background/         # Fundos dinâmicos
```

## 🎯 Personalização

### Adicionar Suas Músicas
```javascript
// Em script.js - Array tracks
{
  name: "Sua Música - Artista (Ano)",
  src: "./tracks/sua-musica.mp3",
  cover: "./covers/sua-capa.jpg",    
  background: "./background/seu-fundo.jpg"
}
```


**Em Desenvolvimento Ativo** - Novas features sendo implementadas regularmente!

---

**Desenvolvido por Murilo Feliciano**
 

import { useEffect, useRef, useState, useCallback } from 'react';
import { initHeroAnimation, initScrollAnimations } from './animations';
import profileImage from '../头像新.jpg';
import portraitImage from '../头像新.jpg';
import projectF3 from '../F3.png';
import coverJujutsu from '../封面/咒术.png';
import coverDisaster from '../封面/改变灾难.png';
import coverBadFilm from '../封面/烂片.png';
import coverWuthering from '../封面/鸣潮f.png';
import ticketStamp from '../票根.png';
import coverTakoP from '../TakoP.png';
import videoPocari from '../6月26日.mp4';
import posterPocari from '../宝矿力水特TVC封面.jpg';
import posterBishe from '../理想国封面.jpg';
import posterLixiangguo from '../毕设作品预告封面.jpg';
import videoTokyo from '../东京调色BGM版.mp4';
import videoLixiangguo from '../理想国.mp4';
import videoBishe from '../毕设作品预告.mp4';
import showreelVideo from '../91mb.mp4';
import showreelPoster from '../showreel封面.jpg';
import posterTokyo from '../东京调色封面.jpg';

/* ---------- Data ---------- */
const contacts = [
  { label: 'Phone', value: '13542011676', href: 'tel:13542011676' },
  { label: 'Email', value: '1461239251@qq.com', href: 'mailto:1461239251@qq.com' },
  {
    label: 'Bilibili',
    value: '个人主页',
    href: 'https://space.bilibili.com/3546885516167691?spm_id_from=333.1007.0.0',
  },
  {
    label: 'Douyin',
    value: '作品主页',
    href: 'https://www.douyin.com/user/self?modal_id=7574662616955666930',
  },
];

const stats = [
  { value: '16+', label: '本地作品素材' },
  { value: '2023-2026', label: '创作经历' },
  { value: '8', label: '视频项目' },
  { value: '2', label: '公开平台' },
];

const projects = [
  { title: '宝矿力水特 TVC', type: '广告短片', tool: 'PR/剪辑', meta: '产品节奏 / 品牌调性', video: videoPocari, poster: posterPocari },
  { title: '乌托邦（毕设预告）', type: '情绪短片', tool: 'PR/剪映', meta: '毕设作品 / 情绪表达', video: videoBishe, poster: posterLixiangguo },
  { title: '东京调色', type: '调色作品', tool: 'DaVinci', meta: '色彩风格 / 视觉质感', video: videoTokyo, poster: posterTokyo },
  { title: '所谓理想悖论', type: '短片视觉', tool: 'AE', meta: '叙事剪辑 / 情绪表达', video: videoLixiangguo, poster: posterBishe },
];

const covers = [
  { title: '令人着迷的轮回系', image: projectF3, link: 'https://www.bilibili.com/video/BV1GiJj6HEdF/?spm_id_from=333.1387.upload.video_card.click' },
  { title: '咒术回战的"电影感"', image: coverJujutsu, link: 'https://www.bilibili.com/video/BV1miAuz8EPk/?spm_id_from=333.1387.upload.video_card.click&vd_source=eb7b8def6dfcd9e3ed47080f0554f599' },
  { title: '改编灾难"霸权社"WIT Studio', image: coverDisaster, link: 'https://www.bilibili.com/video/BV14xdABtES9/?spm_id_from=333.1387.upload.video_card.click&vd_source=eb7b8def6dfcd9e3ed47080f0554f599' },
  { title: '我喜欢这部"烂片"', image: coverBadFilm },
  { title: '章鱼噼原罪', image: coverTakoP },
];

/* ---------- Image Lightbox ---------- */
function ImageLightbox({ src, alt, onClose }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="lightboxOverlay" onClick={onClose}>
      <div className="lightboxContent" onClick={(e) => e.stopPropagation()}>
        <button className="lightboxClose" onClick={onClose} aria-label="关闭">✕</button>
        {!imgLoaded && !imgError && (
          <div className="lightboxLoader">
            <div className="lightboxSpinner" />
            <span>加载中...</span>
          </div>
        )}
        {imgError ? (
          <div className="lightboxError">
            <span>⚠️</span>
            <p>图片加载失败</p>
            <button onClick={() => { setImgError(false); setImgLoaded(false); }}>重试</button>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            style={{ display: imgLoaded ? 'block' : 'none' }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Video Lightbox ---------- */
function VideoLightbox({ src, poster, title, onClose }) {
  const vidRef = useRef(null);
  const [vidStatus, setVidStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const vidStatusRef = useRef(vidStatus);
  vidStatusRef.current = vidStatus; // keep ref in sync so timeout reads live value

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    const vid = vidRef.current;
    if (!vid) return;

    const onReady = () => setVidStatus('ready');
    const onPlaying = () => {
      // If user clicks play before loadedmetadata fires, mark ready anyway
      if (vidStatusRef.current === 'loading') setVidStatus('ready');
    };
    const onError = () => {
      // Only show error overlay during initial load.
      // If video is already playing and browser fires a transient error
      // (e.g. a failed range request on a large file), let the native
      // <video> element handle it — don't hide the video.
      if (vidStatusRef.current === 'loading') setVidStatus('error');
    };

    vid.addEventListener('loadedmetadata', onReady);
    vid.addEventListener('playing', onPlaying);
    vid.addEventListener('error', onError);

    // If already loaded
    if (vid.readyState >= 1) setVidStatus('ready');

    // Safety timeout for initial load only (prevents stuck spinner)
    const timeout = setTimeout(() => {
      if (vidStatusRef.current === 'loading') setVidStatus('error');
    }, 15000);

    return () => {
      vid.removeEventListener('loadedmetadata', onReady);
      vid.removeEventListener('playing', onPlaying);
      vid.removeEventListener('error', onError);
      clearTimeout(timeout);
    };
  }, [src]);

  const handleRetry = () => {
    setVidStatus('loading');
    if (vidRef.current) {
      vidRef.current.load();
    }
  };

  return (
    <div className="lightboxOverlay" onClick={onClose}>
      <div className="lightboxContent videoLightboxContent" onClick={(e) => e.stopPropagation()}>
        <button className="lightboxClose" onClick={onClose} aria-label="关闭">✕</button>

        {vidStatus === 'loading' && (
          <div className="lightboxLoader videoLoader">
            <div className="lightboxSpinner" />
            <span>视频加载中，稍后点击播放...</span>
            {poster && <img className="lightboxPosterFallback" src={poster} alt={title} />}
          </div>
        )}

        {vidStatus === 'error' && (
          <div className="lightboxError videoError">
            <span>⚠️</span>
            <p>视频加载失败</p>
            <p className="lightboxErrorHint">视频文件较大，请检查网络后重试</p>
            <button onClick={handleRetry}>重试</button>
          </div>
        )}

        <video
          ref={vidRef}
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          className="lightboxVideo"
          style={{ display: vidStatus === 'ready' ? 'block' : 'none' }}
        />
        <p className="lightboxVideoTitle">{title}</p>
      </div>
    </div>
  );
}

/* ---------- Nav scroll spy ---------- */
function useScrollSpy() {
  useEffect(() => {
    function onScroll() {
      const nav = document.querySelector('.nav');
      if (!nav) return;
      if (window.scrollY > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

/* ---------- Section English titles ---------- */
const sectionTitles = {
  experience: 'EXPERIENCE',
  projects: 'FEATURED WORKS',
  covers: 'VIDEO COVERS',
  contact: 'GET IN TOUCH',
};

/* ---------- App ---------- */
function App() {
  useScrollSpy();

  useEffect(() => {
    const heroTl = initHeroAnimation();
    const scrollTriggers = initScrollAnimations();
    return () => {
      heroTl.kill();
      scrollTriggers.forEach(st => st.kill());
    };
  }, []);

  const [imgLightbox, setImgLightbox] = useState(null);
  const [videoLightbox, setVideoLightbox] = useState(null);

  return (
    <>
      {/* Frosted glass background — behind all content */}
      <div className="pageBg" />
      <div className="pageGlassOrbs">
        <div className="glassOrb" />
        <div className="glassOrb" />
        <div className="glassOrb" />
        <div className="glassOrb" />
      </div>
      <div className="pageTexture" />

      <main>
        {/* ==================== HERO ==================== */}
      <section className="hero" id="top">
        <div className="heroVeil" />

        <nav className="nav glass">
          <a className="brand" href="#top">CZJ</a>
          <div className="navLinks">
            <a href="#experience">经历</a>
            <a href="#projects">项目</a>
            <a href="#covers">封面</a>
            <a href="#contact">联系</a>
          </div>
          <a className="navCta" href="mailto:1461239251@qq.com">联系我</a>
        </nav>

        <div className="heroContent shell">
          <div className="heroTextCol">
            <div className="heroTopRow">
              <img className="heroAvatar" src={profileImage} alt="陈泽均" />
              <div className="heroKicker glassLite">Film Editor · Visual Storytelling</div>
            </div>
            <h1>陈泽均</h1>
            <div className="heroTagline">求职意向：实习剪辑</div>
            <p>
              剪辑师，专注广告短片、影视混剪、预告片与视觉叙事。用克制的节奏、
              准确的情绪和清晰的画面逻辑，把素材剪成有记忆点的作品。
            </p>
            <div className="heroActions">
              <a href="#projects" className="primaryButton">查看作品</a>
              <a href="#contact" className="secondaryButton">获取联系</a>
            </div>
          </div>

          <div
            className="heroShowreel glass"
            onClick={() => setVideoLightbox({ src: showreelVideo, poster: showreelPoster, title: 'Showreel · 作品精选' })}
          >
            <video
              className="heroShowreelVideo"
              src={showreelVideo}
              poster={showreelPoster}
              muted
              loop
              preload="metadata"
              playsInline
              disablePictureInPicture
            />
            <div className="heroShowreelShade" />
            <div className="heroShowreelLabel">
              <span className="heroShowreelBadge glassLite">SHOWREEL</span>
              <strong>作品精选</strong>
            </div>
            <div className="heroShowreelPlay">
              <span>▶</span>
            </div>
          </div>
        </div>

        <div className="heroMeta glassLite">
          <span>Available for editing internship</span>
          <span>Guangzhou / Remote</span>
        </div>
      </section>

      {/* ==================== EXPERIENCE ==================== */}
      <section className="section experience shell" id="experience">
        <div className="sectionHeader">
          <span className="sectionTitleEn">{sectionTitles.experience}</span>
          <span className="sectionNo">01</span>
          <h2>个人经历</h2>
          <p>从二创、短片到商业 TVC，持续训练故事判断、镜头组织与平台表达。</p>
        </div>

        <div className="experienceGrid anim-stagger">
          <div className="portraitPanel glass">
            <img className="anim-reveal-img" src={portraitImage} alt="陈泽均" />
            <div className="portraitOverlay">
              <strong>2004.07.16</strong>
            </div>
          </div>

          <div className="bioPanel glassLite">
            <span className="eyebrow">I'M A VIDEO EDITOR</span>
            <h3>陈泽均，剪辑师。<br />作品覆盖广告短片、毕设预告、影视/动画/游戏混剪与封面视觉。</h3>
            <p>
              把节奏、情绪和信息密度剪到刚好。
            </p>
            <div className="timeline">
              <div><span>2025 – 2026</span><strong>商业与实习向作品积累</strong></div>
              <div><span>2023 – 2025</span><strong>短片、混剪与平台内容训练</strong></div>
            </div>
            <div className="contactChips">
              {contacts.slice(0, 3).map((item) => (
                <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                  <span>{item.label}</span>
                  {item.value}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="statsGrid anim-stagger">
          {stats.map((stat) => (
            <div className="statCard glass" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== PROJECTS ==================== */}
      <section className="section projects shell" id="projects">
        <div className="sectionHeader">
          <span className="sectionTitleEn">{sectionTitles.projects}</span>
          <span className="sectionNo">02</span>
          <h2>精选项目</h2>
          <p>视频作品与视觉短片，呈现剪辑节奏、叙事把控与画面表达。</p>
        </div>

        <div className="projectQualityNote">为保证视频在站内正常播放，并非最高质量</div>

        <div className="projectGrid anim-stagger">
          {projects.map((project) => (
            <article
              className="projectCard glass featured"
              key={project.title}
              onClick={() => setVideoLightbox({ src: project.video, poster: project.poster, title: project.title })}
            >
              <video
                className="projectCardBg"
                src={project.video}
                poster={project.poster}
                muted
                preload="metadata"
                playsInline
                disablePictureInPicture
              />
              <div className="projectShade" />
              <div className="projectContent">
                <span>{project.type}</span>
                {project.tool && <span className="projectTool">{project.tool}</span>}
                <h3>{project.title}</h3>
                <p>{project.meta}</p>
              </div>
              <div className="projectPlayOverlay">
                <span className="projectPlayIcon">▶</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ==================== VIDEO COVERS ==================== */}
      <section className="section covers shell" id="covers">
        <div className="sectionHeader">
          <span className="sectionTitleEn">{sectionTitles.covers}</span>
          <span className="sectionNo">03</span>
          <h2>视频封面<span className="sectionHint">点击底部文字可跳转部分视频链接</span></h2>
          <div>
            <p>每一支视频的视觉名片——从构图、字体到氛围，封面决定了观众的第一眼。</p>
          </div>
        </div>

        <div className="coverGrid anim-stagger">
          {covers.map((cover) => (
            <article className="coverCard glass" key={cover.title}>
              <div
                className="coverImageWrap"
                onClick={() => setImgLightbox({ src: cover.image, alt: cover.title })}
              >
                <img className="anim-reveal-img anim-parallax" src={cover.image} alt={cover.title} />
              </div>
              <div className="coverInfo">
                {cover.link ? (
                  <a className="coverLink" href={cover.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>{cover.title}</a>
                ) : (
                  <h3>{cover.title}</h3>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ==================== CONTACT ==================== */}
      <section className="contactFinal" id="contact">
        <div className="contactShell shell">
          <span className="sectionTitleEn">{sectionTitles.contact}</span>
          <span className="sectionNo">04</span>
          <h2>让下一条片子，有更准确的呼吸。</h2>
          <p>欢迎联系我获取完整作品集、视频源文件或进一步沟通剪辑合作。</p>
          <div className="finalContacts anim-stagger">
            {contacts.map((item) => (
              <a className="glassLite" href={item.href} key={item.label} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="siteFooter">
        <p className="footerMotto">无限进步</p>
        <p className="footerCredit">本站由Claude Code制作</p>
      </footer>

      {/* ==================== LIGHTBOXES ==================== */}
      {imgLightbox && (
        <ImageLightbox src={imgLightbox.src} alt={imgLightbox.alt} onClose={() => setImgLightbox(null)} />
      )}
      {videoLightbox && (
        <VideoLightbox
          src={videoLightbox.src}
          poster={videoLightbox.poster}
          title={videoLightbox.title}
          onClose={() => setVideoLightbox(null)}
        />
      )}
      </main>
    </>
  );
}

export default App;

type BaseVideoPlayerOptions = {
    videoContainer?: HTMLDivElement;
    initialPlay?: boolean;
    initialMuted?: boolean;
    loop?: boolean;
};

type VideoPlayerOptions = BaseVideoPlayerOptions & {
    video: HTMLVideoElement;
};

type Btn = {
    playPause?: HTMLElement | null;
    volume?: {
        mute: HTMLElement | null;
        slider: HTMLInputElement | null;
    };
    fullScreen?: HTMLElement | null;
    speed?: HTMLElement | null;
    duration?: {
        currentTime: HTMLElement | null;
        totalTime: HTMLElement | null;
    };
    timeline?: HTMLInputElement | null;
};

type Events = {
    loadedData: Event;
    play: Event;
    pause: Event;
    mute: Event;
    unmute: Event;
    volume: Event;
    fullScreenIn: Event;
    fullScreenOut: Event;
    timeUpdate: Event;
    playbackSpeed: Event;
    // caption: Event;
    // pictureInPicture: Event;
};

class VideoPlayer {
    /**
     * Frontend Assets
     */
    // private readonly cssUrl =
    // "http://127.0.0.1:3000/static/css/video-player.css";
    private cssUrl =
        "https://res.cloudinary.com/deepeshgupta/raw/upload/v1657472552/deepeshgupta/video-player/css/video-player-0.0.23_vortiu.css";
    private readonly classNames = {
        videoContainer: "deepeshdg-video-container",
        videoControlsContainer: "deepeshdg-video-controls-container",
        focusBtn: "focus-btn",
    };
    private readonly icons = {
        play: `
            <svg class="play-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" />
            </svg>
        `,
        pause: `
            <svg class="pause-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M14,19H18V5H14M6,19H10V5H6V19Z" />
            </svg>
        `,
        volume: {
            high: `
                <svg class="volume-high-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
                </svg>
            `,
            low: `
                <svg class="volume-low-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M5,9V15H9L14,20V4L9,9M18.5,12C18.5,10.23 17.5,8.71 16,7.97V16C17.5,15.29 18.5,13.76 18.5,12Z" />
                </svg>
            `,
            muted: `
                <svg class="volume-muted-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z" />
                </svg>
            `,
        },
        fullscreen: {
            open: `
                <svg class="open" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
            `,
            close: `
                <svg class="close" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
                </svg>
            `,
        },
    };

    /**
     * Properties of necessary DOM Elements
     */
    private video: HTMLVideoElement;
    private videoContainer?: HTMLDivElement | null;
    private videoControlsContainer?: HTMLDivElement | null;
    private btn: Btn = {};

    /**
     * Metadata of Video
     */
    private isPaused = true;
    private isMuted = false;
    private isFullScreen = false;
    private volume = 1;
    private currentTime = 0;
    private totalTime?: number;

    /**
     * Custom Events
     */
    private events: Events;

    /**
     * Initial State of Video
     */
    private initialPlay: boolean;
    private initialMuted: boolean;
    private loop: boolean;

    constructor(options: VideoPlayerOptions) {
        this.video = options.video;
        this.videoContainer = options.videoContainer;
        this.initialPlay = options.initialPlay ?? false;
        this.initialMuted = options.initialMuted ?? false;
        this.loop = options.loop ?? false;

        /**
         * Creating Custom Events
         */
        this.events = {
            loadedData: new CustomEvent("loadeddata"),
            play: new CustomEvent("play"),
            pause: new CustomEvent("pause"),
            mute: new CustomEvent("mute"),
            unmute: new CustomEvent("unmute"),
            volume: new CustomEvent("volume"),
            timeUpdate: new CustomEvent("timeupdate"),
            fullScreenIn: new CustomEvent("fullscreenin"),
            fullScreenOut: new CustomEvent("fullscreenout"),
            playbackSpeed: new CustomEvent("playbackspeed"),
        };
    }

    public on(
        eventName:
            | "loadeddata"
            | "play"
            | "pause"
            | "mute"
            | "unmute"
            | "volume"
            | "timeupdate"
            | "fullscreenin"
            | "fullscreenout"
            | "playbackspeed",
        listener: (e: Event) => void
    ) {
        this.videoContainer?.addEventListener(eventName, listener);
    }

    public registerCustomEvents() {
        this.on("loadeddata", () => {
            this.totalTime = this.video.duration;

            if (this.btn.duration?.currentTime)
                this.btn.duration.currentTime.textContent =
                    this.getCurrentTime();
            if (this.btn.duration?.totalTime)
                this.btn.duration.totalTime.textContent = this.getTotalTime();

            if (
                this.currentTime >= 0 &&
                this.totalTime >= 0 &&
                this.btn.timeline
            ) {
                this.btn.timeline.value = (
                    (this.currentTime / this.totalTime) *
                    100
                ).toString();
            }
        });

        this.on("play", (e) => {
            const videoContainer = e.target as HTMLDivElement;
            videoContainer.classList.remove("paused");

            if (this.currentTime === this.totalTime && this.loop)
                this.currentTime = 0;

            if (this.video.paused) this.video.play();
            this.isPaused = this.video.paused;
        });

        this.on("pause", (e) => {
            const videoContainer = e.target as HTMLDivElement;
            videoContainer.classList.add("paused");

            if (!this.video.paused) this.video.pause();
            this.isPaused = this.video.paused;
        });

        this.on("mute", () => {
            this.volumeLevel("muted");
            if (!this.video.muted) this.video.muted = true;
            this.isMuted = this.video.muted;
        });

        this.on("unmute", () => {
            if (this.volume <= 0)
                this.volume =
                    Number(this.btn.volume?.slider?.value) > 0
                        ? Number(this.btn.volume?.slider?.value)
                        : 0;

            if (this.video.muted) this.video.muted = false;
            this.isMuted = this.video.muted;
        });

        this.on("volume", () => {
            if (this.volume < 0) {
                this.video.volume = 0;
                this.volume = this.video.volume;
            }

            if (this.volume === 0) {
                this.mute();
                /**
                 * Assigning Volume Value to Input Range to reflect in Frontend
                 */
                if (this.btn.volume?.slider)
                    this.btn.volume.slider.value = this.volume.toString();
                return;
            }

            if (this.video.muted) this.unmute();

            if (this.volume > 1) this.volume = 1;

            this.video.volume = this.volume;
            if (this.volume <= 0.5) this.volumeLevel("low");
            else this.volumeLevel("high");

            /**
             * Assigning Volume Value to Input Range to reflect in Frontend
             */
            if (this.btn.volume?.slider)
                this.btn.volume.slider.value = this.volume.toString();
        });

        this.on("timeupdate", () => {
            if (this.currentTime < 0) this.currentTime = 0;
            if (this.totalTime && this.currentTime > this.totalTime) {
                if (this.loop) this.currentTime = 0;
                else this.currentTime = this.totalTime;
            }

            if (Math.abs(this.currentTime - this.video.currentTime) >= 1)
                this.video.currentTime = this.currentTime;
            else this.currentTime = this.video.currentTime;

            this.trigger("loadeddata");
        });

        this.on("fullscreenin", (e) => {
            const videoContainer = e.target as HTMLDivElement;
            if (!document.fullscreenElement) videoContainer.requestFullscreen();
            this.isFullScreen = true;
            videoContainer.classList.add("fullscreen");
        });

        this.on("fullscreenout", (e) => {
            const videoContainer = e.target as HTMLDivElement;
            if (document.fullscreenElement) document.exitFullscreen();
            this.isFullScreen = false;
            videoContainer.classList.remove("fullscreen");
        });
    }

    public trigger(
        eventName:
            | "loadeddata"
            | "play"
            | "pause"
            | "mute"
            | "unmute"
            | "volume"
            | "timeupdate"
            | "fullscreenin"
            | "fullscreenout"
            | "playbackspeed"
    ) {
        let event: Event;

        switch (eventName) {
            case "loadeddata":
                event = this.events.loadedData;
                break;
            case "play":
                event = this.events.play;
                break;
            case "pause":
                event = this.events.pause;
                break;
            case "mute":
                event = this.events.mute;
                break;
            case "unmute":
                event = this.events.unmute;
                break;
            case "volume":
                event = this.events.volume;
                break;
            case "timeupdate":
                event = this.events.timeUpdate;
                break;
            case "fullscreenin":
                event = this.events.fullScreenIn;
                break;
            case "fullscreenout":
                event = this.events.fullScreenOut;
                break;
            case "playbackspeed":
                event = this.events.playbackSpeed;
                break;
            default:
                return;
                break;
        }

        this.videoContainer?.dispatchEvent(event);
    }

    public getCurrentTime() {
        return this.formatDuration(this.currentTime);
    }

    public getTotalTime() {
        return this.formatDuration(this.totalTime ?? 0);
    }

    public skip(howMuch: number) {
        this.currentTime += howMuch;
        this.trigger("timeupdate");
    }

    public formatDuration(time: number): string {
        const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
            minimumIntegerDigits: 2,
        });

        const seconds = Math.floor(time) % 60;
        const minutes = Math.floor(time / 60) % 60;
        const hours = Math.floor(time / 3600);

        if (hours === 0)
            return `${minutes}:${leadingZeroFormatter.format(seconds)}`;

        return `${hours}:${leadingZeroFormatter.format(
            minutes
        )}:${leadingZeroFormatter.format(seconds)}`;
    }

    public play() {
        this.trigger("play");
    }

    public pause() {
        this.trigger("pause");
    }

    public volumeLevel(level: "low" | "high" | "muted") {
        this.videoContainer?.setAttribute("data-volume-level", level);
    }

    public setVolume(volume: number, percent = false) {
        if (percent) {
            let volumeInPercent = Math.floor(this.volume * 100);

            volumeInPercent -= volumeInPercent % 5;

            volumeInPercent += volume;

            this.volume = Math.floor(volumeInPercent) / 100;
        } else this.volume = volume < 0 ? 0 : volume;
        this.trigger("volume");
    }

    public mute() {
        this.trigger("mute");
    }

    public unmute() {
        this.trigger("unmute");
    }

    public enterFullScreen() {
        this.trigger("fullscreenin");
    }

    public exitFullScreen() {
        this.trigger("fullscreenout");
    }

    public togglePlay() {
        this.isPaused ? this.play() : this.pause();
    }

    public toggleMute() {
        this.isMuted ? this.unmute() : this.mute();
    }

    public toggleFullScreen() {
        this.isFullScreen ? this.exitFullScreen() : this.enterFullScreen();
    }

    public autoPlay() {
        if (this.initialPlay) this.play();
        else this.pause();
    }

    private async _init() {
        const appendCSS = async () => {
            const styleElement = document.createElement("style");

            const styles = await fetch(this.cssUrl);
            styleElement.innerHTML = await styles.text();

            document.head.appendChild(styleElement);

            this.video.style.width = "100%";
            this.video.style.height = "100%";
        };

        const initVideoContainer = () => {
            if (!this.videoContainer) {
                this.videoContainer = document.createElement("div");
                this.videoContainer.classList.add(
                    this.classNames.videoContainer
                );

                this.video.before(this.videoContainer);
                this.videoContainer.appendChild(this.video);
            } else
                this.videoContainer.classList.add(
                    this.classNames.videoContainer
                );

            const focusButton = document.createElement("button");
            focusButton.classList.add(this.classNames.focusBtn);
            this.videoContainer.appendChild(focusButton);

            this.volumeLevel("high");
        };

        const initVideoControllers = () => {
            this.videoControlsContainer = document.createElement("div");
            this.videoControlsContainer.classList.add(
                this.classNames.videoControlsContainer
            );

            this.videoControlsContainer.innerHTML = `
                <div class="mouse-event-zone"></div>
                <div class="controllers">
                    <div class="timeline-controller">
                        <input class="timeline-slider" type="range" min="0" max="100" step="any" value="0"/>
                    </div>
                    <div class="controls">
                        <div class="left">
                            <div class="play-pause-btn-container">
                                <button class="icon-btn play-pause-btn">${
                                    this.icons.play
                                }${this.icons.pause}</button>
                            </div>
                            <div class="volume-container">
                                <button class="icon-btn mute-btn">
                                    ${this.icons.volume.high}
                                    ${this.icons.volume.low}
                                    ${this.icons.volume.muted}
                                </button>
                                <input class="volume-slider" type="range" min="0" max="1" step="0.01" value="1"/>
                            </div>
                            <div class="duration-container">
                                <div class="current-time">${this.getCurrentTime()}</div>
                                /
                                <div class="total-time">${this.getTotalTime()}</div>
                            </div>
                        </div>
                        <div class="right">
                            <div class="fullscreen-btn-container">
                                <button class="icon-btn fullscreen-btn">
                                    ${this.icons.fullscreen.open}
                                    ${this.icons.fullscreen.close}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            this.btn.playPause = this.videoControlsContainer.querySelector(
                ".icon-btn.play-pause-btn"
            );
            this.btn.volume = {
                mute: this.videoControlsContainer.querySelector<HTMLElement>(
                    ".icon-btn.mute-btn"
                ),
                slider: this.videoControlsContainer.querySelector<HTMLInputElement>(
                    `input.volume-slider[type="range"]`
                ),
            };

            this.btn.duration = {
                currentTime:
                    this.videoControlsContainer.querySelector<HTMLElement>(
                        ".current-time"
                    ),
                totalTime:
                    this.videoControlsContainer.querySelector<HTMLElement>(
                        ".total-time"
                    ),
            };

            this.btn.fullScreen =
                this.videoControlsContainer.querySelector<HTMLElement>(
                    `.icon-btn.fullscreen-btn`
                );

            this.btn.timeline =
                this.videoControlsContainer.querySelector<HTMLInputElement>(
                    ".timeline-slider"
                );

            this.videoContainer?.appendChild(this.videoControlsContainer);
        };

        await appendCSS();
        initVideoContainer();
        initVideoControllers();
    }

    public async run() {
        const mouseEvents = () => {
            this.videoControlsContainer
                ?.querySelector(`.controllers`)
                ?.addEventListener("mouseover", () => {
                    this.videoContainer?.classList.add("hover");
                });
            this.videoControlsContainer
                ?.querySelector(`.controllers`)
                ?.addEventListener("mouseout", () => {
                    this.videoContainer?.classList.remove("hover");
                });

            this.videoControlsContainer
                ?.querySelector(".mouse-event-zone")
                ?.addEventListener("click", () => {
                    this.togglePlay();
                    this.videoContainer
                        ?.querySelector<HTMLButtonElement>(
                            `.${this.classNames.focusBtn}`
                        )
                        ?.focus();
                });

            this.videoControlsContainer
                ?.querySelector(".mouse-event-zone")
                ?.addEventListener("dblclick", () => {
                    this.toggleFullScreen();
                });
        };

        const controllersEvents = () => {
            this.btn.playPause?.addEventListener("click", () =>
                this.togglePlay()
            );

            this.btn.volume?.mute?.addEventListener("click", () =>
                this.toggleMute()
            );

            this.btn.volume?.slider?.addEventListener("input", (e) => {
                const target = e.target as HTMLInputElement;
                this.setVolume(Number(target.value));
            });

            this.btn.timeline?.addEventListener("input", (e) => {
                const target = e.target as HTMLInputElement;
                this.currentTime =
                    (Number(this.totalTime) * Number(target.value)) / 100;
                this.trigger("timeupdate");
            });

            this.btn.fullScreen?.addEventListener("click", () =>
                this.toggleFullScreen()
            );
        };

        const keyboardEvents = () => {
            document.body.addEventListener("keydown", (ev) => {
                const noEventTags = ["input", "textarea", "select"];
                const noEventClass = [""];
                const activeTag =
                    document.activeElement?.tagName.toLowerCase() ?? "";
                const activeClass =
                    document.activeElement?.className.split(" ") ?? [];
                if (noEventTags.indexOf(activeTag) > -1) return;
                for (let i = 0; i < activeClass.length; i++) {
                    const className = activeClass[i];
                    if (noEventClass.indexOf(className) > -1) return;
                }

                const activeVideoValidate = (): boolean => {
                    if (this.videoContainer?.contains(document.activeElement)) {
                        ev.preventDefault();
                        return true;
                    }
                    return false;
                };

                switch (ev.key.toLowerCase()) {
                    case " ":
                        for (let i = 0; i < activeClass.length; i++) {
                            const className = activeClass[i];
                            if (className === "icon-btn") return;
                        }
                        if (activeVideoValidate()) this.togglePlay();
                        break;
                    case "k":
                        if (activeVideoValidate()) this.togglePlay();
                        break;
                    case "j":
                        if (activeVideoValidate()) this.skip(-10);
                        break;
                    case "l":
                        if (activeVideoValidate()) this.skip(10);
                        break;
                    case "arrowleft":
                        if (activeVideoValidate()) this.skip(-5);
                        break;
                    case "arrowright":
                        if (activeVideoValidate()) this.skip(5);
                        break;
                    case "arrowup":
                        if (activeVideoValidate()) this.setVolume(5, true);
                        break;
                    case "arrowdown":
                        if (activeVideoValidate()) this.setVolume(-5, true);
                        break;
                    case "f":
                        if (activeVideoValidate()) this.toggleFullScreen();
                        break;
                    case "m":
                        if (activeVideoValidate()) this.toggleMute();
                        break;
                    case "0":
                    case "1":
                    case "2":
                    case "3":
                    case "4":
                    case "5":
                    case "6":
                    case "7":
                    case "8":
                    case "9":
                        this.currentTime =
                            (Number(this.totalTime) *
                                Number(ev.key.toLowerCase())) /
                            10;
                        this.trigger("timeupdate");
                        break;
                    default:
                        break;
                }
            });
        };

        const videoEvents = () => {
            this.video.onloadeddata = () => this.trigger("loadeddata");
            this.video.ontimeupdate = () => this.trigger("timeupdate");
            this.video.onplay = () => this.play();
            this.video.onpause = () => this.pause();
            this.video.addEventListener("volumechange", (e) => {
                const video = e.target as HTMLVideoElement;

                if (video.muted) {
                    this.mute();
                    return;
                }
                this.unmute();
                this.setVolume(video.volume);
            });
            document.addEventListener("fullscreenchange", () => {
                if (document.fullscreenElement) this.enterFullScreen();
                else this.exitFullScreen();
            });
        };

        await this._init();
        this.registerCustomEvents();

        mouseEvents();
        keyboardEvents();
        controllersEvents();
        videoEvents();

        this.autoPlay();

        return this;
    }
}

type VideoPlayerConfigs = BaseVideoPlayerOptions & {
    video: HTMLVideoElement;
    videos?: HTMLVideoElement[];
};

Object.defineProperty(window, "deepeshdg", {
    value: {
        videoPlayer: async (options: VideoPlayerConfigs) => {
            if (options.video) {
                const videoPlayer = new VideoPlayer(options);
                return await videoPlayer.run();
            } else if (options.videos) {
                const response: any[] = [];

                for (let index = 0; index < options.videos.length; index++) {
                    options.video = options.videos[index];
                    const videoPlayer = new VideoPlayer(options);
                    response[index] = await videoPlayer.run();
                }

                return response;
            }

            return false;
        },
    },
    writable: false,
});

const CameraHandler = {
    stream: null,
    videoElement: null,
    canvasElement: null,

    async init(videoSelector) {
        this.videoElement = document.querySelector(videoSelector);
        if (!this.canvasElement) {
            this.canvasElement = document.createElement('canvas');
        }
        return await this.requestPermission();
    },

    async requestPermission() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false
            });
            if (this.videoElement) {
                this.videoElement.srcObject = this.stream;
                await this.videoElement.play();
            }
            return true;
        } catch (err) {
            console.error("Error accessing camera:", err);
            return false;
        }
    },

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
    },

    async capturePhoto() {
        if (!this.stream) return null;

        // Ensure video is ready
        if (this.videoElement.videoWidth === 0) {
            await new Promise(resolve => {
                this.videoElement.onloadedmetadata = resolve;
            });
        }

        const width = this.videoElement.videoWidth;
        const height = this.videoElement.videoHeight;

        this.canvasElement.width = width;
        this.canvasElement.height = height;

        const context = this.canvasElement.getContext('2d');
        context.drawImage(this.videoElement, 0, 0, width, height);

        return new Promise((resolve) => {
            this.canvasElement.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                    resolve(file);
                } else {
                    resolve(null);
                }
            }, 'image/jpeg', 0.9);
        });
    }
};

window.CameraHandler = CameraHandler;

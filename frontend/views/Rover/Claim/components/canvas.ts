export default function myCanvas(myNode: any) {
    class Dot {
        x: number;
        y: number;
        z: number;
        xProject: number;
        yProject: number;
        sizeProjection: number;
        constructor(x: number, y: number, z: number) {
            this.x = x;
            this.y = y;
            this.z = z;

            this.xProject = 0;
            this.yProject = 0;
            this.sizeProjection = 0;
        }
        project(sin: number, cos: number) {
            const rotX = cos * this.x + sin * (this.z - GLOBE_CENTER_Z);
            const rotZ = -sin * this.x + cos * (this.z - GLOBE_CENTER_Z) + GLOBE_CENTER_Z;
            this.sizeProjection = FIELD_OF_VIEW / (FIELD_OF_VIEW - rotZ);
            this.xProject = rotX * this.sizeProjection + PROJECTION_CENTER_X;
            this.yProject = this.y * this.sizeProjection + PROJECTION_CENTER_Y;
        }
        draw(sin: any, cos: any) {
            this.project(sin, cos);
            ctx.beginPath();
            ctx.arc(this.xProject, this.yProject, DOT_RADIUS * this.sizeProjection, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = 'white';
            ctx.fill();
        }
    }

    const canvas = myNode;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext('2d');
    if (window.devicePixelRatio > 1) {
        canvas.width = canvas.clientWidth * 2;
        canvas.height = canvas.clientHeight * 2;
        ctx.scale(2, 2);
    }
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    let rotation = 0;
    let dots: { draw: (arg0: number, arg1: number) => void }[] = [];
    const DOTS_AMOUNT = 800;
    const DOT_RADIUS = 2;
    let GLOBE_RADIUS = width * 0.7;
    let GLOBE_CENTER_Z = -GLOBE_RADIUS;
    let PROJECTION_CENTER_X = width / 2;
    let PROJECTION_CENTER_Y = height / 2;
    let FIELD_OF_VIEW = width * 0.8;

    function createDots() {
        dots.length = 0;
        for (let i = 0; i < DOTS_AMOUNT; i++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(Math.random() * 2 - 1);
            const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta);
            const y = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta);
            const z = GLOBE_RADIUS * Math.cos(phi) + GLOBE_CENTER_Z;
            dots.push(new Dot(x, y, z));
        }
    }

    function render(a: number) {
        ctx.clearRect(0, 0, width, height);
        rotation = a * 0.0004;

        const sineRotation = Math.sin(rotation);
        const cosineRotation = Math.cos(rotation);

        for (var i = 0; i < dots.length; i++) {
            dots[i].draw(sineRotation, cosineRotation);
        }
        window.requestAnimationFrame(render);
    }

    function afterResize() {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        if (window.devicePixelRatio > 1) {
            canvas.width = canvas.clientWidth * 2;
            canvas.height = canvas.clientHeight * 2;
            ctx.scale(2, 2);
        } else {
            canvas.width = width;
            canvas.height = height;
        }
        GLOBE_RADIUS = width * 0.7;
        GLOBE_CENTER_Z = -GLOBE_RADIUS;
        PROJECTION_CENTER_X = width / 2;
        PROJECTION_CENTER_Y = height / 2;
        FIELD_OF_VIEW = width * 0.8;

        createDots();
    }

    let resizeTimeout: number | undefined;
    function onResize() {
        resizeTimeout = window.clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(afterResize, 500);
    }
    window.addEventListener('resize', onResize);
    createDots();
    window.requestAnimationFrame(render);
}

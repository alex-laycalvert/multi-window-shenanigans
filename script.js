"use strict";
import * as THREE from "three";

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);

const Colors = {
    BLACK: {
        color: 0x000000,
        side: THREE.DoubleSide,
        linewidth: 4,
        linecap: "round",
        linejoin: "round",
    },
    GRAY: {
        color: 0x888888,
        side: THREE.DoubleSide,
    },
    RED: {
        color: 0xff0000,
        side: THREE.DoubleSide,
    },
    ORANGE: {
        color: 0xff9000,
        side: THREE.DoubleSide,
    },
    YELLOW: {
        color: 0xffff00,
        side: THREE.DoubleSide,
    },
    GREEN: {
        color: 0x00ff00,
        side: THREE.DoubleSide,
    },
    BLUE: {
        color: 0x0000ff,
        side: THREE.DoubleSide,
    },
    WHITE: {
        color: 0xffffff,
        side: THREE.DoubleSide,
    },
};

const Settings = {
    FIELD_OF_VIEW: 75,
    ASPECT_RATIO: window.innerWidth / window.innerHeight,
    NEAR: 0.1,
    FAR: 1000,
    WIDTH: window.innerWidth,
    HEIGHT: window.innerHeight,
};

async function main() {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-1, -1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        Settings.FIELD_OF_VIEW,
        Settings.ASPECT_RATIO,
        Settings.NEAR,
        Settings.FAR,
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(Settings.WIDTH, Settings.HEIGHT);
    document.body.replaceChildren(renderer.domElement);

    const cube = generateCube();
    scene.add(...cube.flat(3));

    camera.position.z = 5;

    let clicked = false;

    window.addEventListener("wheel", (e) => {
        if (e.shiftKey) {
            camera.position.z += e.deltaY / 500;
            return;
        }
        if (e.ctrlKey) {
            scene.rotateOnWorldAxis(Z, e.deltaY / 1000);
            return;
        }

        const faces = [
            cube[0][2][0],
            cube[0][2][1],
            cube[0][2][2],
            cube[1][2][0],
            cube[1][2][1],
            cube[1][2][2],
            cube[2][2][0],
            cube[2][2][1],
            cube[2][2][2],
        ];

        if (!clicked) {
            scene.rotateOnWorldAxis(X, e.deltaY / 1000);
            scene.rotateOnWorldAxis(Y, e.deltaX / 1000);
            return;
        }

        faces.flat(2).forEach((mesh) => {
            mesh.rotateOnWorldAxis(Y, e.deltaY / 1000);
        });
    });

    window.addEventListener("pointermove", (e) => {
        pointer.x = (e.clientX / Settings.WIDTH) * 2 - 1;
        pointer.y = (e.clientY / Settings.HEIGHT) * 2 - 1;
    });

    function render() {
        window.requestAnimationFrame(render);
        raycaster.setFromCamera(pointer, camera);
        colorCube(cube);
        renderer.render(scene, camera);
    }

    render();
}

main();

/**
 * Returns the sum of the absolute value of each of `nums`
 * @param {...number} nums
 * @returns number
 */
function absSum(...nums) {
    let sum = 0;
    for (let i = 0; i < nums.length; i++) {
        sum += Math.abs(nums[i]);
    }
    return sum;
}

/**
 * @returns {THREE.Mesh[][][][]} cube
 */
function generateCube() {
    const cube = [];
    const l = 1.25;
    const s = (2 * l) / 3;
    for (let z = -l; z <= l; z += l) {
        const slice = [];
        for (let y = -l; y <= l; y += l) {
            const row = [];
            for (let x = -l; x <= l; x += l) {
                if (absSum(x, y, z) === l * 3) {
                    // corner piece
                    const geo1 = new THREE.BoxGeometry(s, s, 0);
                    geo1.translate((x * 2) / 3, (y * 2) / 3, z);
                    const mesh1 = new THREE.Mesh(
                        geo1,
                        new THREE.MeshBasicMaterial(Colors.GRAY),
                    );
                    const geo2 = new THREE.BoxGeometry(0, s, s);
                    geo2.translate(x, (y * 2) / 3, (z * 2) / 3);
                    const mesh2 = new THREE.Mesh(
                        geo2,
                        new THREE.MeshBasicMaterial(Colors.GRAY),
                    );
                    const geo3 = new THREE.BoxGeometry(s, 0, s);
                    geo3.translate((x * 2) / 3, y, (z * 2) / 3);
                    const mesh3 = new THREE.Mesh(
                        geo3,
                        new THREE.MeshBasicMaterial(Colors.GRAY),
                    );
                    row.push([mesh1, mesh2, mesh3]);
                } else if (absSum(x, y, z) === l * 2) {
                    // edge piece
                    if (Math.abs(z) === l) {
                        const geo1 = new THREE.BoxGeometry(s, s, 0);
                        geo1.translate((x * 2) / 3, (y * 2) / 3, z);
                        const mesh1 = new THREE.Mesh(
                            geo1,
                            new THREE.MeshBasicMaterial(Colors.GRAY),
                        );
                        const geo2 = new THREE.BoxGeometry(
                            Math.abs(x) === l ? 0 : s,
                            Math.abs(y) === l ? 0 : s,
                            s,
                        );
                        geo2.translate(x, y, (z * 2) / 3);
                        const mesh2 = new THREE.Mesh(
                            geo2,
                            new THREE.MeshBasicMaterial(Colors.GRAY),
                        );
                        row.push([mesh1, mesh2]);
                    } else if (z === 0) {
                        const geo1 = new THREE.BoxGeometry(0, s, s);
                        geo1.translate(x, (y * 2) / 3, z);
                        const mesh1 = new THREE.Mesh(
                            geo1,
                            new THREE.MeshBasicMaterial(Colors.GRAY),
                        );
                        const geo2 = new THREE.BoxGeometry(s, 0, s);
                        geo2.translate((x * 2) / 3, y, (z * 2) / 3);
                        const mesh2 = new THREE.Mesh(
                            geo2,
                            new THREE.MeshBasicMaterial(Colors.GRAY),
                        );
                        row.push([mesh1, mesh2]);
                    }
                } else if (absSum(x, y, z) === l) {
                    // center
                    const geo = new THREE.BoxGeometry(
                        Math.abs(x) === l ? 0 : s,
                        Math.abs(y) === l ? 0 : s,
                        Math.abs(z) === l ? 0 : s,
                    );
                    geo.translate(x, y, z);
                    const mesh = new THREE.Mesh(
                        geo,
                        new THREE.MeshBasicMaterial(Colors.GRAY),
                    );
                    row.push([mesh]);
                } else {
                    row.push([]);
                }
            }
            slice.push(row);
        }
        cube.push(slice);
    }
    return cube;
}

/**
 * @param {THREE.Mesh[][][][]} cube
 */
function colorCube(cube) {
    cube[2][0][0][0].material.setValues(Colors.RED);
    cube[2][0][1][0].material.setValues(Colors.RED);
    cube[2][0][2][0].material.setValues(Colors.RED);
    cube[2][1][0][0].material.setValues(Colors.RED);
    cube[2][1][1][0].material.setValues(Colors.RED);
    cube[2][1][2][0].material.setValues(Colors.RED);
    cube[2][2][0][0].material.setValues(Colors.RED);
    cube[2][2][1][0].material.setValues(Colors.RED);
    cube[2][2][2][0].material.setValues(Colors.RED);

    cube[0][0][2][1].material.setValues(Colors.BLUE);
    cube[0][1][2][1].material.setValues(Colors.BLUE);
    cube[0][2][2][1].material.setValues(Colors.BLUE);
    cube[1][0][2][0].material.setValues(Colors.BLUE);
    cube[1][1][2][0].material.setValues(Colors.BLUE);
    cube[1][2][2][0].material.setValues(Colors.BLUE);
    cube[2][0][2][1].material.setValues(Colors.BLUE);
    cube[2][1][2][1].material.setValues(Colors.BLUE);
    cube[2][2][2][1].material.setValues(Colors.BLUE);

    cube[0][2][0][2].material.setValues(Colors.WHITE);
    cube[0][2][1][1].material.setValues(Colors.WHITE);
    cube[0][2][2][2].material.setValues(Colors.WHITE);
    cube[1][2][0][1].material.setValues(Colors.WHITE);
    cube[1][2][1][0].material.setValues(Colors.WHITE);
    cube[1][2][2][1].material.setValues(Colors.WHITE);
    cube[2][2][0][2].material.setValues(Colors.WHITE);
    cube[2][2][1][1].material.setValues(Colors.WHITE);
    cube[2][2][2][2].material.setValues(Colors.WHITE);

    cube[0][0][0][0].material.setValues(Colors.ORANGE);
    cube[0][0][1][0].material.setValues(Colors.ORANGE);
    cube[0][0][2][0].material.setValues(Colors.ORANGE);
    cube[0][1][0][0].material.setValues(Colors.ORANGE);
    cube[0][1][1][0].material.setValues(Colors.ORANGE);
    cube[0][1][2][0].material.setValues(Colors.ORANGE);
    cube[0][2][0][0].material.setValues(Colors.ORANGE);
    cube[0][2][1][0].material.setValues(Colors.ORANGE);
    cube[0][2][2][0].material.setValues(Colors.ORANGE);

    cube[0][0][0][1].material.setValues(Colors.GREEN);
    cube[0][1][0][1].material.setValues(Colors.GREEN);
    cube[0][2][0][1].material.setValues(Colors.GREEN);
    cube[1][0][0][0].material.setValues(Colors.GREEN);
    cube[1][1][0][0].material.setValues(Colors.GREEN);
    cube[1][2][0][0].material.setValues(Colors.GREEN);
    cube[2][0][0][1].material.setValues(Colors.GREEN);
    cube[2][1][0][1].material.setValues(Colors.GREEN);
    cube[2][2][0][1].material.setValues(Colors.GREEN);

    cube[0][0][0][2].material.setValues(Colors.YELLOW);
    cube[0][0][1][1].material.setValues(Colors.YELLOW);
    cube[0][0][2][2].material.setValues(Colors.YELLOW);
    cube[1][0][0][1].material.setValues(Colors.YELLOW);
    cube[1][0][1][0].material.setValues(Colors.YELLOW);
    cube[1][0][2][1].material.setValues(Colors.YELLOW);
    cube[2][0][0][2].material.setValues(Colors.YELLOW);
    cube[2][0][1][1].material.setValues(Colors.YELLOW);
    cube[2][0][2][2].material.setValues(Colors.YELLOW);
}

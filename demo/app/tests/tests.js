var FancyCamera = require("nativescript-fancy-camera").FancyCamera;
var fancyCamera = new FancyCamera();

describe("greet function", function() {
    it("exists", function() {
        expect(fancyCamera.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(fancyCamera.greet()).toEqual("Hello, NS");
    });
});
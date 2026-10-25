import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tiltAxis,tiltSteering} from '../client/mobile.js';
import {sanitizeSettings} from '../client/settings.js';
test('tilt maps both landscape directions and portrait to screen steering',()=>{assert.equal(tiltAxis(20,10,90),20);assert.equal(tiltAxis(20,10,270),-20);assert.equal(tiltAxis(20,10,-90),-20);assert.equal(tiltAxis(20,10,0),10);});
test('tilt has a neutral deadzone, bounded range and calibration offset',()=>{assert.equal(tiltSteering(12,10,30),0);assert.equal(tiltSteering(40,10,30),-1);assert.equal(tiltSteering(-20,10,30),1);});
test('control preferences persist as validated settings',()=>{for(const mode of ['wheel','joystick','buttons','tilt'])assert.equal(sanitizeSettings({controlMode:mode}).controlMode,mode);const s=sanitizeSettings({controlMode:'invalid',controlSize:99,controlOpacity:-1,tiltRange:0});assert.equal(s.controlMode,'buttons');assert.equal(s.controlSize,1.2);assert.equal(s.controlOpacity,.4);assert.equal(s.tiltRange,15);});

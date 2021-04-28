const sizeElm = document.getElementById('size');
const downrangeSpreadElm = document.getElementById('spread-downrange');
const crossrangeSpreadElm = document.getElementById('spread-crossrange');
const originGridElm = document.getElementById('origin-grid');
const originSubgridElm = document.getElementById('origin-subgrid');
const targetGridElm = document.getElementById('target-grid');
const targetSubgridElm = document.getElementById('target-subgrid');

const bearingElm = document.getElementById('bearing');
const elevationElm = document.getElementById('elevation');

const bearingSpreadElm = document.getElementById('bearing-spread');
const elevationSpreadElm = document.getElementById('elevation-spread');

const tooCloseElm = document.getElementById('too-close');
const tooFarElm = document.getElementById('too-far');

sizeElm.value = 300;
downrangeSpreadElm.value = 25;
crossrangeSpreadElm.value = 25;

const rangeTable = {
    50  :  1579,
    100 :  1558,
    150 :  1538,
    200 :  1517,
    250 :  1496,
    300 :  1475,
    350 :  1453,
    400 :  1431,
    450 :  1409,
    500 :  1387,
    550 :  1364,
    600 :  1341,
    650 :  1317,
    700 :  1292,
    750 :  1267,
    800 :  1240,
    850 :  1212,
    900 :  1183,
    950 :  1152,
    1000:  1118,
    1050:  1081,
    1100:  1039,
    1150:   988,
    1200:   918,
    1250:   800,
};

const charMap = {
    'a': 1,
    'b': 2,
    'c': 3,
    'd': 4,
    'e': 5,
    'f': 6,
    'g': 7,
    'h': 8,
    'i': 9,
    'j': 10,
    'k': 11,
    'l': 12,
    'm': 13,
    'n': 14,
    'o': 15,
    'p': 16,
    'q': 17,
    'r': 18,
    's': 19,
    't': 20,
    'u': 21,
    'v': 22,
    'w': 23,
    'x': 24,
    'y': 25,
    'z': 26,
};

const keypadArr = [
    {x:  0, y:  0}, // 0 (Not used, just a dummy to align my array)
    {x: -1, y:  1}, // 1
    {x:  0, y:  1}, // 2
    {x:  1, y:  1}, // 3
    {x: -1, y:  0}, // 4
    {x:  0, y:  0}, // 5
    {x:  1, y:  0}, // 6
    {x: -1, y: -1}, // 7
    {x:  0, y: -1}, // 8
    {x:  1, y: -1}, // 9
];

function validateInputs() {
    let valid = true;
    console.log('validating...');
    valid &= validateGrid(originGridElm);
    valid &= validateGrid(targetGridElm);
    valid &= validateSubgrid(originSubgridElm);
    valid &= validateSubgrid(targetSubgridElm);

    if (valid)
    {
        calculateSoln();
    }
    else
    {
        clearOutputs();
    }
}
validateInputs();

function clearOutputs()
{
    for (let elm of [bearingElm, elevationElm, bearingSpreadElm, elevationSpreadElm])
    {
        elm.innerText = 'N/A';
    }

    tooCloseElm.classList.add('hidden');
    tooFarElm.classList.add('hidden');
}

function validateGrid(elm)
{
    let val = elm.value;
    if (/^[A-Za-z][0-9]+$/.test(val))
    {
        elm.classList.add('valid');
        elm.classList.remove('invalid');
        return true;
    }

    elm.classList.add('invalid');
    elm.classList.remove('valid');
    return false;
}

function validateSubgrid(elm)
{
    let val = elm.value;
    if (!val) // empty or undef
    {
        elm.classList.add('optional');
        elm.classList.remove('valid');
        elm.classList.remove('invalid');
        return true;
    }

    if (/^[1-9]+$/.test(val))
    {
        elm.classList.add('valid');
        elm.classList.remove('optional');
        elm.classList.remove('invalid');
        return true;
    }

    elm.classList.add('invalid');
    elm.classList.remove('optional');
    elm.classList.remove('valid');
    return false;
}

function isTooClose(range)
{
    let min = 100000;
    for (let val in rangeTable)
    {
        let r = parseFloat(val);
        if (r < min)
        {
            min = r;
        }
    }
    return min > range;
}

function isTooFar(range)
{
    let max = -1;
    for (let val in rangeTable)
    {
        let r = parseFloat(val);
        if (r > max)
        {
            max = r;
        }
    }
    return max < range;
}

function calculateSoln() {
    // Inputs
    let size = parseFloat(sizeElm.value);
    let originGrid  = originGridElm.value;
    let originSubgrid = originSubgridElm.value;
    let targetGrid  = targetGridElm.value;
    let targetSubgrid = targetSubgridElm.value;

    // Calc positions
    let originPos = gridToCoord(originGrid, originSubgrid, size);
    let targetPos = gridToCoord(targetGrid, targetSubgrid, size);

    // Calc to target
    let originPosNeg = multiplyVectorByScalar(originPos, -1);
    let toTarget = addVectorToVector(targetPos, originPosNeg);
    console.log(`origin pos: ${JSON.stringify(originPos)}`);
    console.log(`target pos: ${JSON.stringify(targetPos)}`);
    console.log(`to target: ${JSON.stringify(toTarget)}`);

    // Calc bearing
    let angle = calculateVectorAngle(toTarget);
    bearingElm.innerText = `${Math.round(angle)}\u00B0`;

    let crossrangeSpread = parseFloat(crossrangeSpreadElm.value);
    let crossrangeDirection = {x: -toTarget.y, y: toTarget.x};
    crossrangeDirection = multiplyVectorByScalar(crossrangeDirection, crossrangeSpread / getVectorMagnitude(crossrangeDirection));
    console.log(`crossrange dir: ${JSON.stringify(crossrangeDirection)}`);
    let minCrossrangePos = addVectorToVector(crossrangeDirection, toTarget);
    let maxCrossrangePos = addVectorToVector(negateVector(crossrangeDirection), toTarget);
    let minAngle = calculateVectorAngle(minCrossrangePos);
    let maxAngle = calculateVectorAngle(maxCrossrangePos);
    bearingSpreadElm.innerText = `Spread: ${Math.round(minAngle)}\u00B0 - ${Math.round(maxAngle)}\u00B0`;

    // Calc range
    let range = getVectorMagnitude(toTarget);

    // Calc mils
    if (isTooClose(range))
    {
        tooFarElm.classList.add('hidden');
        tooCloseElm.classList.remove('hidden');
        elevationElm.innerText = 'N/A';
    }
    else if (isTooFar(range))
    {
        tooCloseElm.classList.add('hidden');
        tooFarElm.classList.remove('hidden');
        elevationElm.innerText = 'N/A';
    }
    else
    {
        tooCloseElm.classList.add('hidden');
        tooFarElm.classList.add('hidden');
        let mils = lerpRangeTable(range);
        elevationElm.innerText = `${Math.round(mils)} mils (${Math.round(range)} meters)`;
        let downrangeSpread = parseFloat(downrangeSpreadElm.value);
        let milsMax = lerpRangeTable(range + downrangeSpread);
        let milsMin = lerpRangeTable(range - downrangeSpread);
        elevationSpreadElm.innerText = `Spread: ${Math.round(milsMin)} mils - ${Math.round(milsMax)} mils`;
    }
}

// Returns mils
function lerpRangeTable(desiredRange) {
    let min = undefined;
    let max = undefined;
    for (let key in rangeTable) 
    {
        let range = parseFloat(key);
        // Get the lower bound as close to the desired range
        if (desiredRange > range && (!min || range > min))
        {
            min = range;
        }

        // Get the upper bound as close to the desired range
        if (desiredRange < range && (!max || range < max))
        {
            max = range;
        }
    }

    if (!min || !max) // Out of bounds, would require extrapolation
    {
        return -1;
    }

    return lerp(desiredRange, min, rangeTable[min], max, rangeTable[max]);
}

function lerp(x, x1, y1, x2, y2)
{
    let m = (y2 - y1) / (x2 - x1);
    let b = y2 - m * x2;
    return m * x + b;
}

function gridToCoord(grid, subgrid, size) {
    let pos = { 
        x: size * 0.5, 
        y: size * 0.5,
    };

    let gridX = grid[0];
    let gridY = grid.substring(1);

    let initOffset = {
        x: (charMap[gridX.toLowerCase()] - 1) * size, // TODO: Check is alpha
        y: (parseInt(gridY) - 1) * size, // TODO: Check is numeric
    }

    pos = addVectorToVector(pos, initOffset);

    if (subgrid.length > 0)
    {
        curr_size = size;
        for (let c of subgrid)
        {
            // TODO: Check is numeric
            curr_size = curr_size / 3;
            let idx = parseInt(c);
            let offset = keypadArr[idx];
            offset = multiplyVectorByScalar(offset, curr_size);
            pos = addVectorToVector(pos, offset);
        }
    }

    pos.y = -pos.y; // To make +Y be positive just for my brain.
    return pos;
}

function negateVector(a) {
    return { x: -a.x, y: -a.y };
}

function addVectorToVector(a, b) {
    let res = { 
        x: a.x + b.x,
        y: a.y + b.y,
    }
    return res;
}

function multiplyVectorByScalar(v, scale) {
    let res = { 
        x: v.x * scale,
        y: v.y * scale,
    }
    return res;
}

function getVectorMagnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function calculateVectorAngle(v) {
    let angle = Math.atan2(v.x, v.y) / Math.PI * 180.0;
    if (angle < 0)
    {
        angle = 360.0 + angle;
    }
    return angle;
}
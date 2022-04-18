'use strict';

class NetJSONGraphUtil {
    /**
     * @function
     * @name JSONParamParse
     *
     * Perform different operations to call NetJSONDataParse function according to different Param types.
     * @param  {object|string}  JSONParam   Url or JSONData
     *
     * @return {object}    A promise object of JSONData
     */

    JSONParamParse(JSONParam) {
        if (typeof JSONParam === 'string') {
            return fetch(JSONParam, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            })
                .then((response) => {
                    if (response.json) {
                        return response.json();
                    } else {
                        return response;
                    }
                })
                .catch((msg) => {
                    console.error(msg);
                });
        } else {
            return Promise.resolve(JSONParam);
        }
    }

    /**
   * @function
   * @name dateParse
   *
   * Parse the time in the browser's current time zone based on the incoming matching rules.
   * The exec result must be [date, year, month, day, hour, minute, second, millisecond?]
   *
   * @param  {string}          dateString
   * @param  {object(RegExp)}  parseRegular
   * @param  {number}          hourDiffer    you can custom time difference, default is the standard time difference

   *
   * @return {string}    Date string
   */

    dateParse({
        dateString,
        parseRegular = /^([1-9]\d{3})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?Z$/,
        hourDiffer = new Date().getTimezoneOffset() / 60,
    }) {
        const dateParseArr = parseRegular.exec(dateString);
        if (!dateParseArr || dateParseArr.length < 7) {
            console.error("Date doesn't meet the specifications.");
            return '';
        }
        const dateNumberFields = ['dateYear', 'dateMonth', 'dateDay', 'dateHour'],
            dateNumberObject = {},
            leapYear =
                (dateParseArr[1] % 4 === 0 && dateParseArr[1] % 100 !== 0) ||
                dateParseArr[1] % 400 === 0,
            limitBoundaries = new Map([
                ['dateMonth', 12],
                ['dateDay', [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]],
                ['dateHour', 24],
            ]);

        for (let i = dateNumberFields.length; i > 0; i--) {
            dateNumberObject[dateNumberFields[i - 1]] = parseInt(dateParseArr[i], 10);
        }

        let carry = -hourDiffer,
            limitBoundary;
        for (let i = dateNumberFields.length; i > 0; i--) {
            if (dateNumberFields[i - 1] === 'dateYear') {
                dateNumberObject[dateNumberFields[i - 1]] += carry;
                break;
            } else if (dateNumberFields[i - 1] === 'dateDay') {
                limitBoundary = limitBoundaries.get('dateDay')[dateNumberObject['dateMonth'] - 1];
            } else {
                limitBoundary = limitBoundaries.get(dateNumberFields[i - 1]);
            }

            let calculateResult = dateNumberObject[dateNumberFields[i - 1]] + carry;

            if (dateNumberFields[i - 1] === 'dateHour') {
                carry = calculateResult < 0 ? -1 : calculateResult >= limitBoundary ? 1 : 0;
            } else {
                carry = calculateResult <= 0 ? -1 : calculateResult > limitBoundary ? 1 : 0;
            }

            if (carry === 1) {
                calculateResult -= limitBoundary;
            } else if (carry < 0) {
                if (dateNumberFields[i - 1] === 'dateDay') {
                    limitBoundary = limitBoundaries.get('dateDay')[
                        (dateNumberObject[dateNumberFields[i - 1]] + 10) % 11
                    ];
                }
                calculateResult += limitBoundary;
            }

            dateNumberObject[dateNumberFields[i - 1]] = calculateResult;
        }

        return (
            dateNumberObject['dateYear'] +
            '.' +
            this.numberMinDigit(dateNumberObject['dateMonth']) +
            '.' +
            this.numberMinDigit(dateNumberObject['dateDay']) +
            ' ' +
            this.numberMinDigit(dateNumberObject['dateHour']) +
            ':' +
            this.numberMinDigit(dateParseArr[5]) +
            ':' +
            this.numberMinDigit(dateParseArr[6]) +
            (dateParseArr[7] ? '.' + this.numberMinDigit(dateParseArr[7], 3) : '')
        );
    }

    /**
     * Guaranteed minimum number of digits
     *
     * @param  {number}      number
     * @param  {number}      digit      min digit
     * @param  {string}      filler
     *
     * @return {string}
     */
    numberMinDigit(number, digit = 2, filler = '0') {
        return (Array(digit).join(filler) + number).slice(-digit);
    }

    /**
     * Judge parameter type
     *
     * @return {bool}
     */
    isObject(x) {
        return Object.prototype.toString.call(x).slice(8, 14) === 'Object';
    }

    /**
     * Judge parameter type
     *
     * @return {bool}
     */
    isArray(x) {
        return Object.prototype.toString.call(x).slice(8, 13) === 'Array';
    }

    /**
     * Judge parameter is a dom element.
     *
     * @return {bool}
     */
    isElement(o) {
        return typeof HTMLElement === 'object'
            ? o instanceof HTMLElement //DOM2
            : o &&
                  typeof o === 'object' &&
                  o !== null &&
                  o.nodeType === 1 &&
                  typeof o.nodeName === 'string';
    }

    /**
     * merge two object deeply
     *
     * @param  {object}
     *
     * @return {object}      targetObj
     */
    deepMergeObj() {
        let objs = [...arguments].reverse(),
            len = objs.length;

        for (let i = 0; i < len - 1; i++) {
            let originObj = objs[i],
                targetObj = objs[i + 1];
            if (originObj && targetObj && this.isObject(targetObj) && this.isObject(originObj)) {
                for (let attr in originObj) {
                    if (
                        !targetObj[attr] ||
                        !(this.isObject(targetObj[attr]) && this.isObject(originObj[attr]))
                    ) {
                        targetObj[attr] = originObj[attr];
                    } else {
                        this.deepMergeObj(targetObj[attr], originObj[attr]);
                    }
                }
            } else if (!targetObj) {
                objs[i + 1] = originObj;
            }
        }

        return objs[len - 1];
    }

    /**
     * @function
     * @name updateMetadata
     *
     * @this  {object}   NetJSONGraph object
     *
     */
    updateMetadata() {
        // if (this.config.metadata) {
        //     document.getElementsByClassName('njg-metadata')[0].style.visibility = 'visible';
        //     document.getElementById('metadata-innerDiv').innerHTML = this.utils._getMetadata.call(
        //         this
        //     );
        // }
    }

    /**
     * @function
     * @name getMetadata
     *
     * Get metadata dom string.
     *
     * @this   {object}   NetJSONGraph object
     * @return {string}   Dom string
     */
    static getMetadata(data) {
        const attrs = ['protocol', 'version', 'revision', 'metric', 'router_id', 'topology_id'],
            metadata = data;
        const metaDataObj = {};

        if (metadata.label) {
            metaDataObj['label'] = metadata.label;
        }
        for (let attr of attrs) {
            if (metadata[attr]) {
                metaDataObj[attr] = metadata[attr];
            }
        }
        metaDataObj['nodes'] = metadata.nodes.length;
        metaDataObj['links'] = metadata.links.length;
        return metaDataObj;
    }

    /**
     * @function
     * @name nodeInfo
     *
     * Parse the infomation of incoming node data.
     * @param  {object}    node
     *
     * @return {string}    html dom string
     */

    static nodeInfo(node) {
        const nodeInfo = {};
        nodeInfo['id'] = node.id;
        if (node.label && typeof node.label === 'string') {
            nodeInfo['label'] = node.label;
        }
        if (node.properties) {
            for (let key in node.properties) {
                if (key === 'location') {
                    nodeInfo[key] = {
                        lat: node.properties.location.lat,
                        lng: node.properties.location.lng,
                    };
                } else if (key === 'time') {
                    const time = this.dateParse({
                        dateString: node.properties[key],
                    });
                    nodeInfo[key] = time;
                } else {
                    nodeInfo[key.replace(/_/g, ' ')] = node.properties[key];
                }
            }
        }
        if (node.linkCount) {
            nodeInfo['linkCount'] = node.linkCount;
        }
        if (node.local_addresses) {
            nodeInfo['local_addresses'] = node.local_addresses;
        }

        return nodeInfo;
    }

    /**
     * @function
     * @name linkInfo
     *
     * Parse the infomation of incoming link data.
     * @param  {object}    link
     *
     * @return {string}    html dom string
     */

    static linkInfo(link) {
        const linkInfo = {};
        linkInfo['source'] = link.source;
        linkInfo['target'] = link.target;
        linkInfo['cost'] = link.cost;
        if (link.properties) {
            for (let key in link.properties) {
                if (key === 'time') {
                    const time = this.dateParse({
                        dateString: link.properties[key],
                    });
                    linkInfo[key] = time;
                } else {
                    linkInfo[key.replace(/_/g, ' ')] = link.properties[key];
                }
            }
        }

        return linkInfo;
    }

    /**
     * @function
     * @name showLoading
     * display loading animation
     *
     * @this {object}      netjsongraph
     *
     * @return {object}    html dom
     */

    showLoading() {
        let loadingContainer = document.getElementById('loadingContainer');

        if (!loadingContainer) {
            loadingContainer = document.createElement('div');
            loadingContainer.setAttribute('id', 'loadingContainer');
            loadingContainer.innerHTML = `
        <div class="loadingElement">
          <div class="loadingSprite"></div>
          <p class="loadingTip">Loading...</p>
        </div>
      `;

            this.el.appendChild(loadingContainer);
        } else {
            loadingContainer.style.visibility = 'visible';
        }

        return loadingContainer;
    }

    /**
     * @function
     * @name hideLoading
     * cancel loading animation
     *
     * @this {object}      netjsongraph
     *
     * @return {object}    html dom
     */

    hideLoading() {
        let loadingContainer = document.getElementById('loadingContainer');

        if (loadingContainer) {
            loadingContainer.style.visibility = 'hidden';
        }

        return loadingContainer;
    }

    createEvent() {
        const events = new Map(),
            events_once = new Map();
        return {
            on(key, ...res) {
                events.set(key, [...(events.get(key) || []), ...res]);
            },
            once(key, ...res) {
                events_once.set(key, [...(events_once.get(key) || []), ...res]);
            },
            emit(key) {
                const funcs = events.get(key) || [],
                    funcs_once = events_once.get(key) || [],
                    res = funcs.map((func) => func()),
                    res_once = funcs_once.map((func) => func());
                events_once.delete(key);
                return [...res, ...res_once];
            },
            delete(key) {
                events.delete(key);
                events_once.delete(key);
            },
        };
    }
}

export default NetJSONGraphUtil;

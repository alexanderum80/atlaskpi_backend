export function my_guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }
  
  export function IsNullOrWhiteSpace(value: string): boolean {
    try {
            if (value === null || value === 'undefined') { return true; }
            return value.toString().replace(/\s/g, '').length < 1;
    } catch (e) {
            console.log(e);
            return false;
    }
  }
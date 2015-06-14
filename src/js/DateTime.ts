/// <reference path="../../typings/moment-timezone/moment-timezone.d.ts" />
/// <reference path="../../typings/moment/moment-node.d.ts" />
import moment = require('moment-timezone');

export enum DateTimeKind {
	Unspecified = 0,
	Utc = 1,
	Local = 2,
}
	
/**
 * DateTime - basic date time based on moment.js
 */
export class DateTime {
	get Kind(): DateTimeKind { return this.kind; }
	kind: DateTimeKind = DateTimeKind.Unspecified;
	get Date(): moment.Moment { return this.momentDate; }
	get currentUtcOffset(): number { return this.momentDate.utcOffset(); }
	private momentDate: moment.Moment;
	momentInstance: any = moment()
	get TotalMilliSeconds(): number { return this.momentDate.valueOf() }
	constructor(date?: DateTime | any, kind: DateTimeKind = DateTimeKind.Unspecified) {
		if (date instanceof DateTime) {
			this.momentDate = date.Date.clone();
		}
		else {
			this.momentDate = moment(date);
		}
		this.kind = kind;

	}
	Format(formatting: string): string {
		return this.momentDate.format(formatting);
	}

	static Parse(value: any, kind: DateTimeKind = DateTimeKind.Unspecified): DateTime {
		return new DateTime(value, kind);
	}
	ToISOString(): string { return this.momentDate.toISOString(); }
	utcOffset(value: number) { this.momentDate.utcOffset(value); }
	static DateTimeToXSDateTime(dateTime: DateTime): string {
		var format = 'YYYY-MM-DDTHH:mm:ss.SSSZ';//using moment format for c#->"yyyy-MM-ddTHH:mm:ss.fff";

		// switch (dateTime.Kind) {
		// 	case DateTimeKind.Utc:
		// 		format += "Z";
		// 		break;
		// 	case DateTimeKind.Local:
		// 		format += "zzz";
		// 		break;
		// 	default:
		// 		break;
		// }
				
		// Depending on the current culture, DateTime formatter will replace ':' with 
		// the DateTimeFormatInfo.TimeSeparator property which may not be ':'. Force the proper string
		// to be used by using the InvariantCulture.
		return dateTime.Format(format);//, CultureInfo.InvariantCulture);
	}
	static DateTimeToXSDate(date: DateTime): string {
		var format = 'YYYY-MM-DDZ';//using moment format for c#->"yyyy-MM-dd";

		// switch (date.Kind) {
		// 	case DateTimeKind.Utc:
		// 		format = "yyyy-MM-ddZ";
		// 		break;
		// 	case DateTimeKind.Unspecified:
		// 		format = "yyyy-MM-dd";
		// 		break;
		// 	default: // DateTimeKind.Local is remaining
		// 		format = "yyyy-MM-ddzzz";
		// 		break;
		// }

		// Depending on the current culture, DateTime formatter will 
		// translate dates from one culture to another (e.g. Gregorian to Lunar).  The server
		// however, considers all dates to be in Gregorian, so using the InvariantCulture will
		// ensure this.
		return date.Format(format);//, CultureInfo.InvariantCulture);
	}


}

/**
* TimeZoneInfo
*/
export class TimeZoneInfo {

	static get Utc(): TimeZoneInfo { return this.utc; }
	private static utc: TimeZoneInfo = new TimeZoneInfo(0);

	static get Local(): TimeZoneInfo { return this.local; }
	private static local: TimeZoneInfo = new TimeZoneInfo(moment().local().utcOffset());

	private offset: number;

	constructor(offset: number) {
		this.offset = offset;
	}

	static IsLocalTimeZone(timeZone: TimeZoneInfo) {
		return timeZone.offset === this.local.offset;
	}
	get DisplayName(): string { return this.offset.toString(); }

	static ConvertTime(dateTime: DateTime, sourceTZ: TimeZoneInfo, destinationTZ: TimeZoneInfo): DateTime {
		var returnDate = new DateTime(dateTime);
		//var offset = returnDate.currentUtcOffset + destinationTZ.offset - sourceTZ.offset 
		returnDate.utcOffset(destinationTZ.offset);
		return returnDate;
	}
}

export {moment};

export class TimeSpan implements moment.Duration {
	private duration: moment.Duration;
	constructor(...args: any[]) {
		this.duration = moment.duration(args);
	}
	humanize(withSuffix?: boolean): string { return this.duration.humanize(withSuffix); }

	as(units: string): number { return this.duration.as(units); }

	milliseconds(): number { return this.duration.milliseconds(); }
	asMilliseconds(): number { return this.duration.asMilliseconds(); }
	get TotalMilliseconds(): number { return this.duration.asMilliseconds(); }

	seconds(): number { return this.duration.seconds(); }
	asSeconds(): number { return this.duration.asSeconds(); }
	get TotalSeconds(): number { return this.duration.asSeconds(); }

	minutes(): number { return this.duration.minutes(); }
	asMinutes(): number { return this.duration.asMinutes(); }
	get TotalMinutes(): number { return this.duration.asMinutes(); }

	hours(): number { return this.duration.hours(); }
	asHours(): number { return this.duration.asHours(); }
	get TotalHours(): number { return this.duration.asHours(); }

	days(): number { return this.duration.days(); }
	asDays(): number { return this.duration.asDays(); }
	get TotalDays(): number { return this.duration.asDays(); }

	months(): number { return this.duration.months(); }
	asMonths(): number { return this.duration.asMonths(); }
	get TotalMonths(): number { return this.duration.asMonths(); }

	years(): number { return this.duration.years(); }
	asYears(): number { return this.duration.asYears(); }
	get TotalYears(): number { return this.duration.asYears(); }

	add(n: number, p: string): moment.Duration;
	add(n: number): moment.Duration;
	add(d: moment.Duration): moment.Duration;
	add(a: any, p?: any): moment.Duration {
		if (arguments.length === 1) {
			return this.duration.add(a);
		}
		else {
			return this.duration.add(a, p);
		}
	}
	subtract(n: number, p: string): moment.Duration;
	subtract(n: number): moment.Duration;
	subtract(d: moment.Duration): moment.Duration;
	subtract(a: any, p?: string): moment.Duration {
		if (arguments.length === 1) {
			return this.duration.subtract(a);
		}
		else {
			return this.duration.subtract(a, p);
		}
	}

	toISOString(): string { return this.duration.toISOString(); }

	private static MillisPerSecond: number = 1000; //const
	private static MillisPerMinute: number = TimeSpan.MillisPerSecond * 60; //     60,000 //const
	private static MillisPerHour: number = TimeSpan.MillisPerMinute * 60;   //  3,600,000 //const
	private static MillisPerDay: number = TimeSpan.MillisPerHour * 24;      // 86,400,000 //const

	private static MaxSeconds: number = Number.MAX_VALUE / TimeSpan.MillisPerSecond;// TimeSpan.TicksPerSecond; //const
	private static MinSeconds: number = Number.MIN_VALUE / TimeSpan.MillisPerSecond;// TimeSpan.TicksPerSecond; //const

	private static MaxMilliSeconds: number = Number.MAX_VALUE;/// TimeSpan.TicksPerMillisecond; //const
	private static MinMilliSeconds: number = Number.MIN_VALUE;/// TimeSpan.TicksPerMillisecond; //const

	//private static  TicksPerTenthSecond:number = TimeSpan.TicksPerMillisecond * 100; //const

	public static Zero: TimeSpan = new TimeSpan(0);//readonly

	public static MaxValueTimeSpan = new TimeSpan(Number.MAX_VALUE);//readonly
	public static MinValueTimeSpan = new TimeSpan(Number.MIN_VALUE);//readonly

	public static FromDays(value: number): TimeSpan { return new TimeSpan(value * TimeSpan.MillisPerDay); }
	public static FromHours(value: number): TimeSpan { return new TimeSpan(value * TimeSpan.MillisPerHour); }
	public static FromMilliseconds(value: number): TimeSpan { return new TimeSpan(value); }
	public static FromMinutes(value: number): TimeSpan { return new TimeSpan(value * TimeSpan.MillisPerMinute); }
	public static FromSeconds(value: number): TimeSpan { return new TimeSpan(value * TimeSpan.MillisPerSecond); }


}
module TimeSpan2 {
	/** TimeSpan basics from c# using momentjs */
	class TimeSpan {
		// non ticks use in js - public static     TicksPerMillisecond:number =  10000; //const
		// non ticks use in js - private static  MillisecondsPerTick:number = 1.0 / TimeSpan.TicksPerMillisecond; //const

		// non ticks use in js - public static  TicksPerSecond:number = TimeSpan.TicksPerMillisecond * 1000;   // 10,000,000 //const
		// non ticks use in js - private static  SecondsPerTick:number =  1.0 / TimeSpan.TicksPerSecond;         // 0.0001 //const

		// non ticks use in js - public static  TicksPerMinute:number = TimeSpan.TicksPerSecond * 60;         // 600,000,000 //const
		// non ticks use in js - private static  MinutesPerTick:number = 1.0 / TimeSpan.TicksPerMinute; // 1.6666666666667e-9 //const

		// non ticks use in js - public static  TicksPerHour:number = TimeSpan.TicksPerMinute * 60;        // 36,000,000,000 //const
		// non ticks use in js - private static  HoursPerTick:number = 1.0 / TimeSpan.TicksPerHour; // 2.77777777777777778e-11 //const

		// non ticks use in js - public static  TicksPerDay:number = TimeSpan.TicksPerHour * 24;          // 864,000,000,000 //const
		// non ticks use in js - private static  DaysPerTick:number = 1.0 / TimeSpan.TicksPerDay; // 1.1574074074074074074e-12 //const

		private static MillisPerSecond: number = 1000; //const
		private static MillisPerMinute: number = TimeSpan.MillisPerSecond * 60; //     60,000 //const
		private static MillisPerHour: number = TimeSpan.MillisPerMinute * 60;   //  3,600,000 //const
		private static MillisPerDay: number = TimeSpan.MillisPerHour * 24;      // 86,400,000 //const

		private static MaxSeconds: number = Number.MAX_VALUE / TimeSpan.MillisPerSecond;// TimeSpan.TicksPerSecond; //const
		private static MinSeconds: number = Number.MIN_VALUE / TimeSpan.MillisPerSecond;// TimeSpan.TicksPerSecond; //const

		private static MaxMilliSeconds: number = Number.MAX_VALUE;/// TimeSpan.TicksPerMillisecond; //const
		private static MinMilliSeconds: number = Number.MIN_VALUE;/// TimeSpan.TicksPerMillisecond; //const

		//private static  TicksPerTenthSecond:number = TimeSpan.TicksPerMillisecond * 100; //const

		public static Zero: TimeSpan = new TimeSpan(0);//readonly

		public static MaxValueTimeSpan = new TimeSpan(Number.MAX_VALUE);//readonly
		public static MinValueTimeSpan = new TimeSpan(Number.MIN_VALUE);//readonly
	
		private _millis: number = 0;

		public constructor(milliseconds: number);
		public constructor(hours: number, minutes: number, seconds: number);
		public constructor(days: number, hours: number, minutes: number, seconds: number);
		public constructor(days: number, hours: number, minutes: number, seconds: number, milliseconds: number);
		public constructor(millisOrHrsOrDays: number, minsOrHrs?: number, secsOrMins?: number, seconds?: number, milliseconds?: number) {
			var argsLength: number = arguments.length;
			var millis = 0;
			if (typeof milliseconds !== 'undefined')
				millis = milliseconds;

			switch (argsLength) {
				case 1:
					this._millis = millisOrHrsOrDays;
					break;
				case 3:
					this._millis = TimeSpan.TimeToTicks(millisOrHrsOrDays, minsOrHrs, secsOrMins);
					break;
				case 4:
				case 5:
					var totalSeconds = millisOrHrsOrDays * 24 * 3600 + minsOrHrs * 3600 + secsOrMins * 60 + seconds;
					if (totalSeconds > TimeSpan.MaxSeconds || totalSeconds < TimeSpan.MinSeconds)
						throw new Error("DateTime.ts - TimeSpan.ctor - Overflow_TimeSpanTooLong");//ArgumentOutOfRangeException				
					this._millis = totalSeconds * TimeSpan.MillisPerSecond + millis;
					break
				default:
					throw new Error("DateTime.ts - TimeSpan.ctor - invalid number of arguments");
			}

		}

		private static TimeToTicks(hour: number, minute: number, second: number): number {
			// totalSeconds is bounded by 2^31 * 2^12 + 2^31 * 2^8 + 2^31,
			// which is less than 2^44, meaning we won't overflow totalSeconds.
			var totalSeconds = hour * 3600 + minute * 60 + second;
			if (totalSeconds > this.MaxSeconds || totalSeconds < this.MinSeconds)
				throw new Error("DateTime.ts - TimeSpan.TimeToTicks - Overflow_TimeSpanTooLong");//ArgumentOutOfRangeException
			return totalSeconds * this.MillisPerSecond;
		}

		public get Days(): number { return Math.floor(this._millis / TimeSpan.MillisPerDay); }
		public get Hours(): number { return Math.floor(this._millis / TimeSpan.MillisPerHour); }
		public get Milliseconds(): number { return Math.floor(this._millis); }
		public get Minutes(): number { return Math.floor(this._millis / TimeSpan.MillisPerMinute); }
		public get Seconds(): number { return Math.floor(this._millis / TimeSpan.MillisPerSecond); }
		//public get Ticks(): number { return Math.floor( this._millis / TimeSpan.); }
		public get TotalDays(): number { return this._millis / TimeSpan.MillisPerDay; }
		public get TotalHours(): number { return this._millis / TimeSpan.MillisPerHour; }
		public get TotalMilliseconds(): number { return this._millis; }
		public get TotalMinutes(): number { return this._millis / TimeSpan.MillisPerMinute; }
		public get TotalSeconds(): number { return this._millis / TimeSpan.MillisPerSecond; }
		// Compares two TimeSpan values, returning an integer that indicates their
		// relationship.
		//
		public static Compare(t1: TimeSpan, t2: TimeSpan): number {
			if (t1._millis > t2._millis) return 1;
			if (t1._millis < t2._millis) return -1;
			return 0;
		}
		public static Equals(t1: TimeSpan, t2: TimeSpan): boolean { return t1._millis === t2._millis; }
		public static FromDays(value: number): TimeSpan { return new TimeSpan(value * TimeSpan.MillisPerDay); }
		public static FromHours(value: number): TimeSpan { return new TimeSpan(value * TimeSpan.MillisPerHour); }
		public static FromMilliseconds(value: number): TimeSpan { return new TimeSpan(value); }
		public static FromMinutes(value: number): TimeSpan { return new TimeSpan(value * TimeSpan.MillisPerMinute); }
		public static FromSeconds(value: number): TimeSpan { return new TimeSpan(value * TimeSpan.MillisPerSecond); }
		//public static FromTicks(value: number): TimeSpan{ return new TimeSpan(value * TimeSpan.MillisPerDay); }
		public static Parse(s: string): TimeSpan {
			return null;
		}
		//public static Parse(input: string, formatProvider: IFormatProvider): TimeSpan;

		//public static ParseExact(string input, string[] formats, IFormatProvider formatProvider): TimeSpan;
		//public static ParseExact(string input, string format, IFormatProvider formatProvider): TimeSpan;
		//public static ParseExact(string input, string[] formats, IFormatProvider formatProvider, TimeSpanStyles styles): TimeSpan;
		//public static ParseExact(string input, string format, IFormatProvider formatProvider, TimeSpanStyles styles): TimeSpan;
		//public static TryParse(string s, out TimeSpan result): boolean;
		//public static TryParse(string input, IFormatProvider formatProvider, out TimeSpan result): boolean;
		//public static TryParseExact(string input, string[] formats, IFormatProvider formatProvider, out TimeSpan result): boolean;
		//public static TryParseExact(string input, string format, IFormatProvider formatProvider, out TimeSpan result): boolean;
		//public static TryParseExact(string input, string[] formats, IFormatProvider formatProvider, TimeSpanStyles styles, out TimeSpan result): boolean;
		//public static TryParseExact(string input, string format, IFormatProvider formatProvider, TimeSpanStyles styles, out TimeSpan result): boolean { }
		public Add(ts: TimeSpan): TimeSpan {
			var result = this._millis + ts._millis;
			// Overflow if signs of operands was identical and result's sign was opposite.
			// >> 63 gives the sign bit (either 64 1's or 64 0's).
			if ((this._millis >>> 63 === ts._millis >> 63) && (this.Milliseconds >>> 63 !== result >> 63))
				throw new Error("Overflow_TimeSpanTooLong");//OverflowException
			return new TimeSpan(result);
		}
		public CompareTo(value: TimeSpan): number;
		public CompareTo(value: any): number;
		public CompareTo(value: any): number {
			if (!(value instanceof TimeSpan))
				throw new Error("Arg_MustBeTimeSpan");//ArgumentException
			var m: number = (<TimeSpan>value)._millis;
			if (this._millis > m) return 1;
			if (this._millis < m) return -1;
			return 0;
		}
		// public Duration(): TimeSpan;
		// public Equals(objTimeSpan): boolean;
		// public override bool Equals(object value);
		// public override int GetHashCode();
		// public Negate(): TimeSpan;
		// public Subtract(ts: TimeSpan): TimeSpan;
		// public ToString(): string;
		// public ToString(format: string): string;
		// public ToString(format: string, formatProvider: IFormatProvider): string;



		// public static TimeSpan operator + (TimeSpan t);
		// public static TimeSpan operator + (TimeSpan t1, TimeSpan t2);
		// public static TimeSpan operator - (TimeSpan t);
		// public static TimeSpan operator - (TimeSpan t1, TimeSpan t2);
		// public static bool operator == (TimeSpan t1, TimeSpan t2);
		// public static bool operator != (TimeSpan t1, TimeSpan t2);
		// public static bool operator <(TimeSpan t1, TimeSpan t2);
		// public static bool operator >(TimeSpan t1, TimeSpan t2);
		// public static bool operator <= (TimeSpan t1, TimeSpan t2);
		// public static bool operator >= (TimeSpan t1, TimeSpan t2);

	}
}
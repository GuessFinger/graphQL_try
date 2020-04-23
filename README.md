# graphQL_test
- 为什么要用graphql？？？
在实际的工作中，比如我需要查询大屏列表信息 列表中的大屏名称是我最关心的 其他的信息我不需要 现在的项目中为了保持接口的统一性(
其他的某个地方也有需要调用的)  导致的问题就是这个接口非常的中  现在在查询大屏列表页面就非常的卡 因为里面无用的信息太多了
我们现在用graphql目的是把接口变成动态的

- GraphQL学习

1. 查询和变更
字段(Fields):GraphQL是请求对象上的特定字段，从页面上可以看出来 查询和结果拥有一样的结构 是他的一个重要特性
查询：
```
{
	hero {
		name
	}
}
结果：
{
	"data":{
		"hero":{
			"name":"EZ"
		}
	}
}
```
上面的查询是可交互的 也就是你可以改变查询的字段  然后查看结果
我们在上面的例子中查询的name返回的是一个字符串  我们指定的字段也可以是对象类型(Object) 同样的也可以对这个对象的字段进行 次级选择 这个是什么意思呢？ 就是选择这个对象中的某个字段 
```
{
	hero {
		name
		# 查询是可以有备注的
		firends {
			name
		}
	}
}
```
实际friends返回的是一个数组 GraphQL 会通过schema所指示的内容 预测 会得到哪一种
```
{
	"data":{
		"hero":{
			"name":"ez",
			"friends":[
				{
					"name":"les"
				},
				{
					"name":"hz"
				}
			]
		}
	}
}
```
到现在为止 我们发现查询的时候 层级关系嵌套的时候 没有: 
参数(Arguments) 我们可以给字段添加上参数
```
{
	human(id:"1000"){
		name
		height
	}
}
同时也可以添加自己的定制类型  这个应该是在后面会学习的
{
	human(id:"1000"){
		name
		height(unit:FOOT)
	}
}
```
别名(Aliases) 我们现在没有办法通过不同参数来查询相同的字段  他这个意思应该是就算查询出来了 但是没有办法区分 这就是我们需要别名的原因  后面解释是因为存在两个hero字段将会产生冲突的
```
{
	empireHero:hero(episode:EMPIRE){
		name
	}
	jediHero:hero(episode:JEDO){
		name
	}
}
```

片段(Fragments) 你可能需要查询相同类型的两个对象 将他们进行比较 但是这个对象里面有很多的属性 我们不想把这些属性写两遍  这时候需要的就是片段 Fragments 其中这个... 和ES6语法中数组意义好像
```
{
	empireHero:hero(episode:EMPIRE){
		...comparisonFields
	}
	jediHero:hero(episode:JEDO){
		...comparisonFields
	}
}

fragment comparisonFields on Character{
	name
	appearsIn
	friends{
		name
	}
}
```
在片段中我们还可以使用变量  这个在变量篇会介绍

操作名称(Operation name) 我们之前使用了简写语法 省略了query关键字和查询名称 我们在生产中需要使用 来减少歧义
query 操作类型关键字 操作名称  HeroNameAndFriends
```
query HeroNameAndFriends{
	hero{
		name
		friends{
			name
		}
	}
}
```
操作类型可以是query  mutation(改变)  subscription(订阅) 描述你打算做什么类型的操作 当然你也可以采用最上面的简写方式
操作名称是我们的操作的有意义和明确的名称 就和上面的操作类型一样 鼓励使用 方便查问题

变量(Variables)
在上面的例子中 我们把参数写到了查询字符串内 很多的时候我们可能需要传入的是动态的参数 但是为什么不把动态参数直接传到查询字符串里面呢？  因为这样它的客户端就得动态的在运行是操作这些查询字符串 在吧它序列化成GraphQL专用的格式 
一级方法 将动态值提取到查询之外 然后作为费力的字典传进去 这些动态的值我们就成为变量
1. 使用$variableName 代替查询中的静态值
2. 声明$variableName 为查询接受的变量之一
3. 将variableName:value 通过传输专用的分离的变量字典中 vaiiables:{'episode':'ez'}  以json的方式进行传递变量
```
query HeroNameAndFriends($episode:Episode){
	hero(episode:$episode){
		name
		friends{
			name
		}
	}
}
```
上面($episode:Episode) 已经列出所有的变量  变量的前缀必须是$  刚才我还纳闷后面找个Episode 是什么东西呢？ 它这个是规定你前面变量的类型

所有生命的变量都必须是标量 枚举型挥着输入对象类型  如果想要传递一个复杂的对象 你必须知道服务器上其匹配的类型 这个意思就是你需要这个对象名把

变量定义可以是可选的或者是必要的 如果 ($episode:Episode!) 后面有! 表示这个变量是必要的

默认变量 ($episode:Episode = "JEDI")  这样我们可以不传变量直接进行调用  如果你还传入变量了 那么默认值将被覆盖

指令(Dirctives)  上面我们通过变量来避免手动字符串插值构建动态查询 指令的意义就是根据条件改变查询结构
```
query Hero($episode:Episode,$withFirends:Boolean!){
	hero(episode:$episode){
		name
		friends @include(if:$withFirends){
			name
		}
	}
}

查询  从上面的include 还有if  可以理解为这个就是条件查询  如果满足条件 同样也查询friends
{
	"episode":"JEDI",
	"withFriends":false
}
```

我们现在支持两种指令 
@include(if:Boolean) 仅在参数为true的时候  包含此字段
@skip(if:Boolean) 仅在参数为true的时候 跳过此字段  这个跳过的话 包含字段里面次级选择

变更(Mutations) 它这个意思就是 我们也需要一个改变服务端数据的方法  
```
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}
变更
{
  "ep": "JEDI",
  "review": {
    "stars": 5,
    "commentary": "This is a great movie!"
  }
}
```
上面的 review 变量非标量  它是一个输入对象类型  这个还是在后面进行学习

查询和变更之间的区别是  查询字段的时候是并行执行的  变更是线性执行 一个接着一个 防止出现竞态


内联片段(inline Fragements)
元字段(Meta fields)

Scheam和类型

类型系统(Type System)
1. 我们以一个特殊的对象 root 开始
2. 选择上面的hero字段
3. 对于hero返回的对象 我们选中name 和appearsIn 字段

之前也了解过了 GraphQL 查询的结构和结果非常的相似  因此就算我们不知道服务器的情况 我们依旧可以预测返回什么结果  
但是一个关于我们所需要的数据的确切描述依旧很有意义 我们能选择什么字段  服务器会返回哪种对象？ 这些对象有哪些字段可用？  这就是我们引入schmea的原因

每一个GraphQL 服务都会定义一套类型 用以描述可能从那个服务查询到的数据 每当查询来临的时候 服务器就会根据schema验证并执行查询  验证并执行查询  感觉有点像预查询

对象类型和字段(Object Types and Fields)
一个 GraphQL scheam 中最基本的组件是对象类型  它表示你可以从服务器上获取到什么类型的对象 以及这个对象有什么字段
```
type Character{
	name:String!
	appearsIn:[Episode!]!
}
我们来解释一下上面的语法

```
- Character 是一个GraphQL对象类型 表示其是一个拥有一些字段的类型 我们的schema中大多数类型都会是对象类型
- name 和 appearsIn 是Character 类型上的字段 这意味着在一个操作Character类型的GraphQL查询中的任何部分 都只能出现 name 和 appearsIn 字段  注意修饰词 只能
- String  内置的标量类型之一 解释说这个标量没有办法进行次级选择   (后面会介绍内置的标量类型)
- String! 表示整个字段是非空的 这个上面也是有说的
- [Episode!]! 表示一个Episode数组  最后面那个! 表示你一定能得到一个数组(可能是零个或者多个对象) 由于Episode! 也是非空的 所以你可以预期到数组中的每个项目都是一个Episode 对象


参数(Arguments) 
GraphQL 对象类型上的每一个字段都可能有零个或者多个参数  
```
type Starship{
	id:ID!
	name:String!
	length(unit:LengthUnit = METER):Float
}
```
在GraphQL中所有参数都是具名的 并且进行具名传递  参数可能是必选的或者可选的 当一个参数是可选的 我们可以定义一个默认值  上面的例子 如果unit 没有传递 它将会被默认认为METER


查询和变更类型(The Query and Mutation Types)
我们的schema中大多数的类型都是普通对象类型  但是一个schema内有两个特殊类型
```
scheam {
	query:Query
	mutation:Mutation
}
```
每一个GraphQL 服务都有一个query类型  可能有一个mutation类型 这个类型和常规对象差不多 他们之所以特殊就是因为他们定义了每一个GraphQL查询的入口
```
type Query{
	hero(episode:Episode):Character
	droid(id:ID!):Droid
}
```
变更也是类似的工作方式 —— 你在 Mutation 类型上定义一些字段，然后这些字段将作为 mutation 根字段使用，接着你就能在你的查询中调用。

标量类型(Scalar Types) 标量类型你没有任何次级字段  因为他们表示对象GraphQL查询的叶子节点
- Int  有符号32位整数
- Float 有符号的双精度浮点值
- String UTF-8 字符序列
- Boolean true/false
- ID 表示一个唯一的标识符 

大部分的GraphQL服务的实现中 都有自定义标量类型的方式  我们可以定义一个Date 类型
我们指定Date类型应该总是被序列化成整型时间戳

枚举类型(Enumeration Types) 是一种特殊的标量 它限制在一个特殊的可选值的集合内
1. 验证这个类型的任何参数都是可选值的某一个
2. 于类型系统沟通 一个字段总是一个有限值集合中的一个值
```
enum Episode{
	NEWHOPE
	EMPIRE
	JEDO
}
```
上面的就表示 无论我们在schema的哪处使用Episode 都是上面类型中的一种

接口(Interfaces)  这个和在java中的接口比较类似  你手动写一个比较大的接口 然后实现的话 在继承的基础上书写更多的细节
```
interface Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
}

// 在继承的基础行进行了拓展
type Human implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  starships: [Starship]
  totalCredits: Int
}

type Droid implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  primaryFunction: String
}
```
内联片段(Inline Fragmetns)
```
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    name
    ... on Droid {
      primaryFunction
    }
    ... on Human {
      height
    }
  }
}
上面的查询 hero字段返回Character类型 取决于episode 通过了解这个是一个枚举类型  所以这个的解释就是  如果返回的类型是 Droid 就查询  primaryFunction  如果是Human 就返回height 字段 
```

联合类型（Union Types）
```
{
  search(text: "o") {
    __typename
    ... on Human {
      name
      height
    }
    ... on Droid {
      name
      primaryFunction
    }
    ... on Starship {
      name
      length
    }
  }
}
如果我们不添加 __typename的话  就是ifd的关系  如果返回的视哪一个对象 我们查询哪个字段
```

输入类型(Input Types)
```
input ReviewInput {
  stars: Int!
  commentary: String
}

mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}
参数
{
  "ep": "JEDI",
  "review": {
    "stars": 5,
    "commentary": "This is a great movie!"
  }
}
也可以这样用
```










